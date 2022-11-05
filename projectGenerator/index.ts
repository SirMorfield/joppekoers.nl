import fs from 'fs-extra'
import * as path from 'path'
import { default as sanitizeFilename } from 'sanitize-filename'
import { Path, exec, createThumbnail, imageSize, Job, FileName, Image, Project, projectToProjectExport } from './util'

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

function normalizeName(name: FileName, index: number) {
	if (index > 99) throw new Error('Index too large')
	return `${index.toString().padStart(2, '0')}${path.extname(name)}`
}

async function processImage(image: Path, output: Path, index: number): Promise<Image> {
	const dimensions = await imageSize(image)
	const newName = normalizeName(path.basename(image), index)
	const newPath = sanatize(path.join(output, newName))
	await fs.copy(image, newPath)

	// TODO instead of copy and overwrite optimized version write optimized version straigth to new location
	// TODO display sizes
	const { stderr } = await exec(`jpegoptim --max=${JPEG_QUALITY} ${newPath}`)
	// console.log(stdout.replace(/\n+$/, ''))
	if (stderr) throw new Error(stderr)

	return {
		name: newName,
		path: newPath,
		width: dimensions.width,
		height: dimensions.height,
	}
}

async function runJob(job: Job): Promise<Project> {
	// remove all previously generated files
	await fs.emptyDir(job.output)

	const images: Image[] = []
	let i = 0
	for (const image of job.imgs) {
		if (image.match(/\/thumbnail/)) continue

		images.push(await processImage(image, job.output, i++))
	}

	let thumbnail: Image | undefined = images.find((img) => /^thumbnail.*/.test(img.name))
	if (!thumbnail) {
		const thumbnailPath = path.join(job.output, `thumbnail${job.imgs[0]!.match(/\.[0-9a-z]+$/)![0]}`)
		thumbnail = await createThumbnail(job.imgs[0]!, thumbnailPath)
		console.log(`Created thumbnail ${thumbnailPath}`)
	}

	const project: Project = {
		id: job.id,
		thumbnail,
		images,
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

;(async () => {
	const jobs = await getJobs(inputPath)
	const projects: Project[] = []

	// TODO: parallelize
	for (const job of jobs) {
		console.log(`Project ${job.id}`)
		projects.push(await runJob(job))
	}

	console.log(JSON.stringify(projects.map(projectToProjectExport)))
})()
