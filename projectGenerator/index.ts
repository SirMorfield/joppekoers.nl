import fs from 'fs-extra'
import path from 'path'
import { Image, Path, Project, exec, createThumbnail, imageSize, hasThumbnail, exit, Job, FileName } from "./util"
import { default as sanitizeFilename } from 'sanitize-filename'

function sanatize(path: string): string {
	return path.split('/').map(name => sanitizeFilename(name.replace(/\s/g, '-').toLowerCase())).join('/')
}

const JPEG_QUALITY = 50

// const inputPath: Path = path.join(__dirname, 'input')
const inputPath: Path = path.join(__dirname, '../../projects/projects')
fs.mkdirSync(inputPath, { recursive: true })
// const outputPath: Path = path.join(__dirname, 'output')
const outputPath: Path = path.join(__dirname, '../public/img/projectImg')
fs.mkdirSync(outputPath, { recursive: true })

// const inputPath: Path = path.join(__dirname, '../public/img/projectImg/')

function normalizeName(name: FileName, index: number) {
	if (index > 99)
		throw new Error('Index too large')
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
	if (stderr)
		throw new Error(stderr)

	return {
		name: newName,
		path: newPath,
		width: dimensions.width,
		height: dimensions.height
	}
}

async function runJob(job: Job): Promise<Image[]> {
	// remove all previously generated files
	await fs.emptyDir(job.output)

	const imageDb: Image[] = []
	let i = 0;
	for (const image of job.imgs) {
		if (image.match(/\/thumbnail/))
			continue

		imageDb.push(await processImage(image, job.output, i++))
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
		const imgs = (await fs.promises.readdir(inputPath))
			.map((img) => path.join(inputPath, img))
			.filter((name) => {
				const isImage = !!name.match(/\.jpg$/)
				if (!isImage)
					console.log(`WARNING: ignoring non-image file ${name}`)
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

	for (const project of Object.keys(projectsDb)) {
		console.log(`<div class="project block scale-up"><img src="/img/projectImg/${project}/thumbnail.jpg" onclick="openPopup('${project}')" class="lazyload projectImg"></div>`)
	}
})()

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
// copy to prod:
// scp -r ~/git/joppekoers.nl/public/img/projectImg/ joppe@joppekoers.nl:~/server1/nodejs/public/img/
