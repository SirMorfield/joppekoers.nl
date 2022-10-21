const path = require('path')
const exec = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const projectsPath = path.join(__dirname, '../../../public/img/projectImg/')

async function createThumbnail(imagePath, thumbnailPath) {
	let { stderr } = await exec(`convert -resize 'X300' '${imagePath}' '${thumbnailPath}'`)
	if (stderr) console.error(stderr)
}

async function imageSize(path) {
	const identity = await exec(`identify -format "%wx%h" '${path}'`)
	if (identity.stderr) console.error(identity.stderr)
	identity.stdout = identity.stdout.trim()
	identity.stdout = identity.stdout.split('x')
	let result = {
		width: parseInt(identity.stdout[0]),
		height: parseInt(identity.stdout[1])
	}
	// account for some android phones in which
	//the data is stored in portrait mode, but the photo was taken in vertical
	try {
		const exif = await exec(`exif -t Orientation -m '${path}'`)
		if (
			exif.stdout.match(/Right\-top/m) ||
			exif.stdout.match(/Left\-bottom/m)
		) {
			console.log(`Flipped ${path}`)
			const temp = result.width
			result.width = result.height
			result.height = temp
		}
	} catch (err) { }
	return result
}

function hasThumbnail(images) {
	for (const image of images) {
		if (image.match(/^thumbnail.*/))
			return true
	}
	return false
}

interface Image {
	src: string
	w: number
	h: number
}

async function parseImages(projectPath): Promise<Image[]> {
	const images = await fs.promises.readdir(projectPath)
	if (images.length == 0)
		return []
	if (!hasThumbnail(images)) {
		const thumbnailPath = path.join(projectPath, `thumbnail${images[0].match(/\.[0-9a-z]+$/)[0]}`)
		createThumbnail(path.join(projectPath, images[0]), thumbnailPath)
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

async function getProject(projectID) {
	let res = {
		imgs: await parseImages(path.join(projectsPath, projectID)),
		root: path.join('/img/projectImg/', projectID) + '/'
	}
	// console.log(`Done: ${projectID}\n`)
	return res
}

(async () => {
	let projects = await fs.promises.readdir(projectsPath)
	let projectsDb = {}
	for (const project of projects) {
		console.log(`> ${project}`)
		projectsDb[project] = await getProject(project)
		console.log(' ')
	}

	let projectsDbStr = JSON.stringify(projectsDb)
	projectsDbStr = projectsDbStr.replace(/\"src\"\:/g, 'src:')
	projectsDbStr = projectsDbStr.replace(/\"imgs\"\:/g, 'imgs:')
	projectsDbStr = projectsDbStr.replace(/\"root\"\:/g, 'root:')
	projectsDbStr = projectsDbStr.replace(/\"w\"\:/g, 'w:')
	projectsDbStr = projectsDbStr.replace(/\"h\"\:/g, 'h:')
	projectsDbStr = `const projects = ${projectsDbStr}`

	let publicOpenPopup = await fs.promises.readFile(path.join(__dirname, '../../../src/other/templatesAndModules/openPopup.txt'))
	publicOpenPopup = publicOpenPopup.toString()
	publicOpenPopup = publicOpenPopup.replace('// projectsPlaceholder', projectsDbStr)
	await fs.promises.writeFile(path.join(__dirname, '../../../public/js/openPopup.js'), publicOpenPopup)
})()

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
