const path = require('path')
const fs = require('fs')

const projectsPath = path.join(__dirname, '../../public/img/projectImg/')

async function createThumbnail(imagePath, thumbnailPath) {
	const { stderr } = await exec(`convert -resize 'X400' '${imagePath}' '${thumbnailPath}'`)
	if (stderr) console.error(stderr)
}

const exec = require('util').promisify(require('child_process').exec)
async function imageSize(path) {
	const identity = await exec(`identify -format "%wx%h" '${path}'`)
	if (identity.stderr) console.error(stderr)
	identity.stdout = identity.stdout.trim()
	identity.stdout = identity.stdout.split('x')
	result = {
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
			const temp = result.width
			result.width = result.height
			result.height = temp
			console.log(`Swapped ${path}`)
		}
	} catch (err) { }
	return result
}

async function parseImages(projectPath) {
	const images = await fs.promises.readdir(projectPath)
	if (images.length == 0)
		return []
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
		console.log(`Done: ${projectID}\n`)
	}
	projectsDb = JSON.stringify(projectsDb)
	projectsDb = projectsDb.replace(/\"src\"\:/g, 'src:')
	projectsDb = projectsDb.replace(/\"imgs\"\:/g, 'imgs:')
	projectsDb = projectsDb.replace(/\"root\"\:/g, 'root:')
	projectsDb = projectsDb.replace(/\"w\"\:/g, 'w:')
	projectsDb = projectsDb.replace(/\"h\"\:/g, 'h:')
	projectsDb = `const projects = ${projectsDb}`

	let publicOpenPopup = await fs.promises.readFile(path.join(__dirname, 'openPopup.txt'))
	publicOpenPopup = publicOpenPopup.toString()
	publicOpenPopup = publicOpenPopup.replace('// projectsPlaceholder', projectsDb)
	await fs.promises.writeFile(path.join(__dirname, '../../public/js/openPopup.js'), publicOpenPopup)
})()

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
