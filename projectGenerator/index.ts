import fs from 'fs-extra'
import * as path from 'path'
import { default as sanitizeFilename } from 'sanitize-filename'
import { Path, exec, imageInfo, Job, Image, Project, projectToProjectExport, imageInfoString } from './util'

function sanatize(path: string): string {
	return path
		.split('/')
		.map((name) => sanitizeFilename(name.replace(/\s/g, '-').toLowerCase()))
		.join('/')
}

const JPEG_QUALITY = 50

const inputPath: Path = path.join(__dirname, '../../projects/projects') // directory inside the ~/git repo
fs.mkdirSync(inputPath, { recursive: true })

const outputPath: Path = path.join(__dirname, '../frontend/public/img/projectImg')
fs.mkdirSync(outputPath, { recursive: true })

// const inputPath: Path = path.join(__dirname, '../public/img/projectImg/')

function getTmpPath(pathIn: Path): Path {
	const parse = path.parse(pathIn)
	return path.join(parse.dir, parse.name + '.tmp' + parse.ext)
}

/**
 * @param fileName the name of the file without extension to be generated
 */
async function processImage(input: Path, output: Path, fileName: string, width?: number): Promise<Image> {
	if (fileName.indexOf('.') != -1)
		throw new Error('fileName must not contain extension')
	fileName += '.webp'

	const inputImageInfo = await imageInfo(input)

	const newPath = sanatize(path.join(output, fileName))

	if (width !== undefined) {
		const tmpPath = getTmpPath(newPath)
		await exec(`convert -resize '${width}X' '${input}' '${tmpPath}'`)
		input = tmpPath
	}

	// TODO display sizes
	const { stderr } = await exec(`magick -quality ${JPEG_QUALITY} '${input}' '${newPath}'`)

	if (width !== undefined) {
		fs.unlink(input)
	}
	if (stderr) throw new Error(stderr)

	const outputImageInfo = await imageInfo(newPath)
	console.log(`Old image: ${imageInfoString(inputImageInfo)}`)
	console.log(`New image: ${imageInfoString(outputImageInfo)}`)
	console.log(`Optimized ${Math.round((outputImageInfo.size / inputImageInfo.size) * 100)}X\n`)

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
	if (job.imgs.length === 0) throw new Error('No images found')

	const thumbnail = await processImage(job.imgs[0]!, job.output, 'thumbnail', 300)
	console.log(`Created thumbnail ${thumbnail.path}`)

	const images: Promise<Image>[] = job.imgs.map(async (image, i) => {
		const name = i.toString().padStart(2, '0')
		return await processImage(image, job.output, name)
	})

	const project: Project = {
		id: job.id,
		thumbnail,
		images: await Promise.all(images)
	}
	return project
}

// Generate TODOs
async function getJobs(inputsPath: Path): Promise<Job[]> {
	const files = await fs.promises.readdir(inputsPath)
	const dirs = files.filter((file) => fs.statSync(path.join(inputPath, file)).isDirectory())

	const inputs = dirs.map(async (dir) => {
		const inputPath = path.join(inputsPath, dir)
		const imgs = (await fs.promises.readdir(inputPath))
			.map((img) => path.join(inputPath, img))
			.filter((name) => {
				const isImage = !!name.match(/\.jpg$/)
				if (!isImage) console.log(`WARNING: ignoring non-image file ${name}`)
				return isImage
			})
		return {
			id: sanatize(dir),
			imgs,
			output: sanatize(path.join(outputPath, dir)),
		}
	})
	return Promise.all(inputs)
}

; (async () => {
	const jobs = await getJobs(inputPath)
	const projects: Project[] = []

	// TODO: parallelize
	for (const job of jobs) {
		console.log(`Project ${job.id}`)
		projects.push(await runJob(job))
	}

	console.log(JSON.stringify(projects.map(projectToProjectExport)))
})()
