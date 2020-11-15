const path = require('path')
const db = require(path.join(process.env.root, 'server/db.js'))

function drop(req, res) {
	res.render('drop.ejs')
}

async function upload(req, res) {
	let files = req.files.upfile
	if (!files) {
		res.send('No File selected')
		return
	}
	if (!Array.isArray(files)) { // if there is only one file
		files = [files]
	}
	const msg = await db.saveFiles(files, req.body.identifier)
	if (msg.error) {
		res.send(msg.error)
		return
	}
	res.send(`Done, go to <b>joppekoers.nl/drop/${req.body.identifier}</b> to download it`)
}

async function download(req, res) {
	const identifier = req.params.identifier
	if (identifier.length == 0) {
		res.send('Empty identifier')
		return
	}
	const files = await db.getFiles(identifier)
	if (files.length == 0) {
		res.send('Identifier not found')
		return
	}
	for (const file of files) {
		console.log(file)
		res.download(file.path, file.name)
	}
}

module.exports = {
	drop,
	upload,
	download,
	fileUpload: db.fileUpload
}
