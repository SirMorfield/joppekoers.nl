const path = require('path')
const fs = require('fs')
const exec = require('util').promisify(require('child_process').exec)

const projectsPath = path.join(__dirname, '../../public/img/projectImg/')

async function createThumbnail(imagePath, thumbnailPath) {
	let { stderr } = await exec(`convert -resize 'X300' '${imagePath}' '${thumbnailPath}'`)
	if (stderr) console.error(stderr)
}

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

async function parseImages(projectPath) {
	const images = await fs.promises.readdir(projectPath)
	if (images.length == 0)
		return []
	if (!hasThumbnail(images)) {
		const thumbnailPath = path.join(projectPath, `thumbnail${images[0].match(/\.[0-9a-z]+$/)[0]}`)
		createThumbnail(path.join(projectPath, images[0]), thumbnailPath)
		console.log(`Created thumbnail ${thumbnailPath}`)
	}
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

async function getProject(projectID) {
	let res = {}
	res.imgs = await parseImages(path.join(projectsPath, projectID))
	res.root = path.join('/img/projectImg/', projectID) + '/'
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
