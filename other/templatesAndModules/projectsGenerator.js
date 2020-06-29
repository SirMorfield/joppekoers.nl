const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))
const path = require('path')
const fs = require('fs');

(async () => {
	const project = process.argv[2]
	const individual = process.argv[3] == 1
	const folderPath = path.join(__dirname, '../public/img/projectImg', project)


	let filesFormated = []

	const files = fs.readdirSync(folderPath)

	for (const file of files) {
		let src = path.join('/img/projectImg/', project, file)
		let dimensions = await sizeOf(path.join(__dirname, '../public/', src))

		filesFormated.push({
			src: individual ? src : file,
			w: dimensions.width,
			h: dimensions.height
		})
	}

	let thumbnail = path.join('/img/projectImg/', project, files[0])

	// JSON to object, eg "foo": "bar" --> foo:"bar"
	filesFormated = JSON.stringify(filesFormated)
	filesFormated = filesFormated.replace(/\"src\"/g, 'src')
	filesFormated = filesFormated.replace(/\"w\"/g, 'w')
	filesFormated = filesFormated.replace(/\"h\"/g, 'h')


	let img
	if (individual) img = `<img src="${thumbnail}" onclick='openPopup(${filesFormated})' class="lazyload flexbinImage" id="${project}">`
	else {
		const root = path.join('/img/projectImg/', project) + '/'
		img = `<img src="${thumbnail}" onclick='openPopup(${filesFormated},"${root}")' class="lazyload flexbinImage" id="${project}">`
	}
	console.log(img)

})()
// used to generate new project img tag used by flexbin on the home page

// node templatesAndModules/projectsGenerator.js folder individual
// folder:STR       name of folder in /public/img/projectImg
// individual:BOOL  show full path in image:
//                  <img src="/img/projectImg/hammer/0.jpg" onclick='openPopup([{src:"/img/projectImg/hammer/0.jpg",w:1200,h:1600}])' class="flexbinImage" id="hammer">
//                  or show with rootLocation:
//                  <img src="/img/projectImg/wolmolen/0.jpg" onclick='openPopup([{src:"0.jpg",w:2756,h:1550}],"/img/projectImg/wolmolen/")' class="flexbinImage" id="wolmolen">
//                  default FALSE

// create small preview image with
// convert -resize 'X300' 0.jpg 0h300px.jpg
