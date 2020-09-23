const path = require('path')
const db = require(path.join(process.env.root, 'server/db.js'))

function drop(req, res) {
	res.render('drop.ejs')
}

async function upload(req, res) {
	if (!req.files.upfile) {
		res.send('No File selected')
		return
	}
	const file = req.files.upfile
	const identifier = req.body.identifier
	const savePath = await db.getSavePath(identifier, file.name, file.size)
	if (savePath.error) {
		res.send(savePath.error)
		return
	}
	file.mv(savePath, (err) => {
		if (err) {
			console.error(err)
			res.send('Error occurred')
			return
		}
		res.send(`Done, go to <b>joppekoers.nl/drop/${identifier}</b> to download it`)
	})
}

async function download(req, res) {
	const identifier = req.params.identifier
	if (identifier.length == 0) {
		res.send('Empty identifier')
		return
	}
	if (!db.info[identifier]) {
		res.send('Identifier not found')
		return
	}
	for (const file of db.info[identifier]) {
		res.download(file.path, file.name)
	}
}

module.exports = {
	drop,
	upload,
	download,
	fileUpload: db.fileUpload
}
