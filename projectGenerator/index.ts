import fs from 'fs-extra'
import path from 'path'
import { Image, Path, Project, createThumbnail, imageSize, hasThumbnail, exit } from "./util"

const inputPath: Path = path.join(__dirname, 'input')
// const inputPath: Path = path.join(__dirname, '../public/img/projectImg/')

async function parseImages(projectPath): Promise<Image[]> {
	const images = await fs.promises.readdir(projectPath)

	if (!hasThumbnail(images)) {
		const thumbnailPath = path.join(projectPath, `thumbnail${images[0]!.match(/\.[0-9a-z]+$/)![0]}`)
		createThumbnail(path.join(projectPath, images[0]!), thumbnailPath)
		console.log(`Created thumbnail ${thumbnailPath}`)
	}

	let imageDb: Image[] = []
	for (const image of images) {
		if (image.match(/^thumbnail.*/))
			continue
		let dimensions = await imageSize(path.join(projectPath, image))
		imageDb.push({
			src: image,
			w: dimensions.width,
			h: dimensions.height
		})
	}
	return imageDb
}

async function getProject(projectID): Promise<Project> {
	const res = {
		imgs: await parseImages(path.join(inputPath, projectID)),
		root: path.join('/img/projectImg/', projectID) + '/'
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

async function getInput(inputPath: Path): Promise<Path[]> {
	const files = await fs.promises.readdir(inputPath)
	const dirs = files.filter((file) => fs.statSync(path.join(inputPath, file)).isDirectory())
	return dirs
}

(async () => {
	const projects: Path[] = await getInput(inputPath)
	const projectsDb: { [key: string]: Project } = {}

	for (const project of projects) {
		console.log(`Project ${project}`)
		if (projectsDb[project])
			exit(`Project ${project} already exists`)

		projectsDb[project] = await getProject(project)
	}

	await installProjects(projectsDb)
})()

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
