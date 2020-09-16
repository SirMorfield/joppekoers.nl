const path = require('path')
const fs = require('fs')
const exec = require('util').promisify(require('child_process').exec)

const projectsPath = path.join(__dirname, '../../public/img/projectImg/')

async function createThumbnail(imagePath, thumbnailPath) {
	const extention = imagePath.match(/\.[0-9a-z]+$/)[0] || '.jpg'

	const uncompressedFile = `/tmp/${Date.now()}${extention}`
	let { stderr } = await exec(`convert -resize 'X300' '${imagePath}' '${uncompressedFile}'`)
	const uncompressedSize = (await fs.promises.stat(uncompressedFile)).size
	if (stderr) console.error(stderr)

	let { stderr2 } = await exec(`jpegoptim '${uncompressedFile}'`)
	if (stderr2) console.error(stderr2)
	const compressedFile = uncompressedFile
	const compressedSize = (await fs.promises.stat(compressedFile)).size
	const sizeDelta = `${((uncompressedSize - compressedSize) / 1024).toFixed(3)} KiB`.padStart('1024.000 KiB'.length, ' ')
	const sizeDeltaPercent = `${((uncompressedSize - compressedSize) / uncompressedSize).toFixed(3)}%`.padEnd('100.000%'.length, ' ')
	const uncompressedSizeStr = `${(uncompressedSize / 1024).toFixed(3)} KiB`.padStart('1024.000 KiB'.length, ' ')
	const compressedSizeStr = `${(uncompressedSize / 1024).toFixed(3)} KiB`.padStart('1024.000 KiB'.length, ' ')
	console.log(`${sizeDeltaPercent} ${sizeDelta} ${uncompressedSizeStr} -> ${compressedSizeStr} - ${imagePath}`)
	await fs.promises.rename(compressedFile, thumbnailPath)
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
			const temp = result.width
			result.width = result.height
			result.height = temp
		}
	} catch (err) { }
	return result
}

async function parseImages(projectPath) {
	const images = await fs.promises.readdir(projectPath)
	if (images.length == 0)
		return []
	const thumbnailPath = path.join(projectPath, `thumbnail${images[0].match(/\.[0-9a-z]+$/)[0]}`)
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
		projectsDb[project] = await getProject(project)
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
