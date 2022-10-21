import fs from 'fs-extra'
import path from 'path'
import { Image, Path, Project, createThumbnail, imageSize, hasThumbnail, exit, Job, FileName } from "./util"

const inputPath: Path = path.join(__dirname, 'input')
fs.mkdirSync(inputPath, { recursive: true })
const outputPath: Path = path.join(__dirname, 'output')
fs.mkdirSync(outputPath, { recursive: true })

// const inputPath: Path = path.join(__dirname, '../public/img/projectImg/')

function normalizeName(name: FileName, index: number) {
	if (index > 99)
		throw new Error('Index too large')
	return `${index.toString().padStart(2, '0')}.${path.extname(name)}`
}

async function runJob(job: Job): Promise<Image[]> {
	// remove all previously generated files
	await fs.emptyDir(job.output)

	const imageDb: Image[] = []
	let i = 0;
	for (const image of job.imgs) {
		if (image.match(/\/thumbnail/))
			continue

		const dimensions = await imageSize(image)
		imageDb.push({
			name: path.basename(image),
			path: image,
			width: dimensions.width,
			height: dimensions.height
		})
		const newName = normalizeName(path.basename(image), i++)
		await fs.copy(image, path.join(job.output, newName))
	}

	if (!hasThumbnail(job.imgs)) {
		const thumbnailPath = path.join(job.output, `thumbnail${job.imgs[0]!.match(/\.[0-9a-z]+$/)![0]}`)
		createThumbnail(job.imgs[0]!, thumbnailPath)
		console.log(`Created thumbnail ${thumbnailPath}`)
	}

	return imageDb
}

async function generateProjectFromJob(job: Job): Promise<Project> {
	const images = await runJob(job)
	const res = {
		imgs: images.map(image => ({ src: image.name, w: image.width, h: image.height })),
		root: path.join('/img/projectImg/', job.id) + '/'
	}
	// console.log(`Done: ${projectID}\n`)
	return res
}

async function installProjects(projectsDb: { [key: string]: Project }): Promise<void> {
	const projects = JSON.stringify(projectsDb)
		.replace(/\"src\"\:/g, 'src:')
		.replace(/\"imgs\"\:/g, 'imgs:')
		.replace(/\"root\"\:/g, 'root:')
		.replace(/\"w\"\:/g, 'w:')
		.replace(/\"h\"\:/g, 'h:')

	const publicOpenPopup = (await fs.promises.readFile(path.join(__dirname, 'openPopup.txt')))
		.toString()
		.replace('// projectsPlaceholder', `const projects = ${projects}`)

	await fs.promises.writeFile(path.join(__dirname, '../public/js/openPopup.js'), publicOpenPopup)
}

// Generate TODOs
async function getJobs(inputsPath: Path): Promise<Job[]> {
	const files = await fs.promises.readdir(inputsPath)
	const dirs = files.filter((file) => fs.statSync(path.join(inputPath, file)).isDirectory())

	const inputs = dirs.map(async (dir) => {
		const inputPath = path.join(inputsPath, dir)
		const imgs = await fs.promises.readdir(inputPath)
		return {
			id: dir,
			imgs: imgs.map((img) => path.join(inputPath, img)),
			output: path.join(outputPath, dir),
		}
	})
	return Promise.all(inputs)
}

(async () => {
	const jobs = await getJobs(inputPath)
	const projectsDb: { [key: string]: Project } = {}

	for (const job of jobs) {
		console.log(`Project ${job.id}`)
		if (projectsDb[job.id])
			exit(`Project ${job.id} already exists`)

		projectsDb[job.id] = await generateProjectFromJob(job)
	}

	await installProjects(projectsDb)
})()

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
