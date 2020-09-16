const { promisify } = require('util')
const imageSize = promisify(require('image-size'))
const path = require('path')
const fs = require('fs')
const exec = require('util').promisify(require('child_process').exec)

const projectsPath = path.join(__dirname, '../../public/img/projectImg/')

async function createThumbnail(imagePath, thumbnailPath) {
	const { stderr } = await exec(`convert -resize 'X400' '${imagePath}' '${thumbnailPath}'`)
	if (stderr) console.error(stderr)
}

async function parseImages(projectPath) {
	const images = await fs.promises.readdir(projectPath)
	const thumbnailPath = path.join(projectPath, `thumbnail${images[0].match(/\..*$/)[0]}`)
	await createThumbnail(path.join(projectPath, images[0]), thumbnailPath)
	let imageDb = []
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

(async () => {
	const projectIDs = await fs.promises.readdir(projectsPath)
	let projectsDb = {}
	for (const projectID of projectIDs) {
		projectsDb[projectID] = {}
		projectsDb[projectID].imgs = await parseImages(path.join(projectsPath, projectID))
		projectsDb[projectID].root = path.join('/img/projectImg/', projectID) + '/'
		console.log(`Done: ${projectID}`)
	}
	projectsDb = JSON.stringify(projectsDb)
	projectsDb = projectsDb.replace(/\"src\"\:/g, 'src:')
	projectsDb = projectsDb.replace(/\"imgs\"\:/g, 'imgs:')
	projectsDb = projectsDb.replace(/\"root\"\:/g, 'root:')
	projectsDb = projectsDb.replace(/\"w\"\:/g, 'w:')
	projectsDb = projectsDb.replace(/\"h\"\:/g, 'h:')

	let publicOpenPopup = await fs.promises.readFile(path.join(__dirname, 'openPopupTemplate.js'))
	publicOpenPopup += 'const projects = '
	publicOpenPopup += projectsDb
	await fs.promises.writeFile(path.join(__dirname, '../../public/js/openPopup.js'), publicOpenPopup)
})()

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
