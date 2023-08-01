import fs from 'fs-extra'
import * as path from 'path'
import { default as sanitizeFilename } from 'sanitize-filename'
import { Path, exec, imageInfo, Job, Image, Project, projectToProjectExport, imageInfoString, ImageInfo } from './util'

function sanatize(path: string): string {
	return path
		.split('/')
		.map(name => sanitizeFilename(name.replace(/\s/g, '-').toLowerCase()))
		.join('/')
}

const QUALITY = 70

const inputPath: Path = '/input'
fs.mkdirSync(inputPath, { recursive: true })

const outputPath: Path = '/output'
fs.mkdirSync(outputPath, { recursive: true })

const exportPath = '/export'

function getTmpPath(pathIn: Path): Path {
	const parse = path.parse(pathIn)
	return path.join(parse.dir, `${parse.name}.tmp${parse.ext}`)
}

function printImageDiff(before: ImageInfo, after: ImageInfo) {
	console.log(`Old image: ${imageInfoString(before)}`)
	console.log(`New image: ${imageInfoString(after)}`)
	const optimized = before.size / after.size
	console.log(`Times smaller: ${optimized.toFixed(2)}x ${''.padStart(Math.min(80, optimized), '#')}\n`)
}

async function preTransform(input: Path, output: Path, width?: number): Promise<{ info: ImageInfo; shouldDelete: boolean }> {
	let info = await imageInfo(input)

	const transformations: string[] = []
	if (width) {
		transformations.push(`-resize ${width}X`)
	}

	switch (info.rotation) {
		case 90:
			console.log(`Fixing incorrect EXIF data in ${input}`)
			transformations.push('-rotate 90')
			break
		case 0:
			break
		case 'error':
			// TODO: handle error
			break
	}

	let tmpPath: Path | undefined
	if (transformations.length > 0) {
		const inputFileName = path.basename(input)
		const newPath = path.join(output, inputFileName)

		tmpPath = getTmpPath(newPath)
		await exec(`convert ${transformations.join(' ')} '${input}' '${tmpPath}'`).catch(err => {
			console.error('=============================')
			console.error(`Error while transforming ${input}`, err)
			console.error('=============================')
		})
		info = await imageInfo(tmpPath)
	}

	return { info: info, shouldDelete: !!tmpPath }
}

/**
 * @param fileName the name of the file without extension to be generated
 */
async function processImage(input: Path, output: Path, fileName: string, width?: number): Promise<Image> {
	if (fileName.indexOf('.') !== -1) {
		throw new Error('fileName must not contain extension')
	}
	fileName += '.webp'

	const { info: inputImageInfo, shouldDelete } = await preTransform(input, output, width)
	const newPath = path.join(output, fileName)

	const { stderr } = await exec(`convert -quality ${QUALITY} '${inputImageInfo.path}' '${newPath}'`)

	if (shouldDelete) {
		fs.unlink(inputImageInfo.path)
	}
	if (stderr) {
		throw new Error(stderr)
	}

	const outputImageInfo = await imageInfo(newPath)
	printImageDiff(inputImageInfo, outputImageInfo)

	return {
		name: fileName,
		path: newPath,
		width: outputImageInfo.width,
		height: outputImageInfo.height,
		size: outputImageInfo.size,
	}
}

async function runJob(job: Job): Promise<Project> {
	// remove all previously generated files
	await fs.emptyDir(job.output)
	if (job.imgs.length <= 0) {
		throw new Error('No images found')
	}

	// const thumbnail = await processImage(job.imgs[0] as string, job.output, 'thumbnail', 500)

	const images: Promise<Image>[] = job.imgs.map((image, i) => {
		const name = i.toString().padStart(2, '0')
		return processImage(image, job.output, name)
	})

	const project: Project = {
		id: job.id,
		thumbnail: (await images[0]) as Image,
		images: await Promise.all(images),
	}
	return project
}

// Generate TODOs
async function getJobs(inputsPath: Path): Promise<Job[]> {
	const files = await fs.promises.readdir(inputsPath)
	const dirs = files.filter(file => fs.statSync(path.join(inputPath, file)).isDirectory())

	const inputs = dirs.map(async dir => {
		const inputPath = path.join(inputsPath, dir)
		const imgs = (await fs.promises.readdir(inputPath))
			.map(img => path.join(inputPath, img))
			.filter(name => {
				const isImage = !!name.match(/\.jpg$/)
				if (!isImage) {
					console.log(`WARNING: ignoring non-image file ${name}`)
				}
				return isImage
			})
		return {
			id: sanatize(dir),
			imgs,
			output: path.join(outputPath, sanatize(dir)),
		}
	})
	return Promise.all(inputs)
}

void (async () => {
	console.time('Completed in')

	const jobs = await getJobs(inputPath)
	const projects: Project[] = []

	// TODO: parallelize
	for (const job of jobs) {
		console.log(`Project ${job.id}`)
		projects.push(await runJob(job))
	}

	if (fs.existsSync(exportPath)) {
		const file = fs.readFileSync(exportPath, 'utf8').toString()
		const newFile = file.replace(/let projects1: ProjectExport\[\] = .*/, `let projects1: ProjectExport[] = ${JSON.stringify(projects.map(projectToProjectExport))}`)
		fs.writeFileSync(exportPath, newFile)
	}
	console.timeEnd('Completed in')
})()
