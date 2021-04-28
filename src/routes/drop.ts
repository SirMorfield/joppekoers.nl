const fs = require('fs')
const path = require('path')
const db = require(path.join(process.env.srcRoot, 'server/db.js'))
const Busboy = require('busboy')

function drop(req, res) {
	res.render('drop.ejs')
}

async function upload(req, res) {
	let busboy = new Busboy({ headers: req.headers })
	let files = []

	busboy.on('file', async (fieldName, stream, filename, encoding, mimetype) => {
		let file = {
			name: filename,
			path: await db.newFilePath(),
		}
		if (!file.path) {
			stream.resume() // aka stream.close()
			return
		}
		files.push(file)
		console.log(file.path)
		stream.pipe(fs.createWriteStream(file.path))
		// stream.on('end', () => { })
	})

	busboy.on('finish', () => {
		if (files.length == 0) {
			res.send('No files uploaded')
		}
		let id = db.addToDb(files)
		const userAgent = (req.get('user-agent')).toLowerCase()
		if (userAgent.includes('curl') || userAgent.includes('wget')) {
			res.send(`joppekoers.nl/drop/${id}`)
		} else {
			res.send(`Done, go to <b>joppekoers.nl/drop/${id}</b> to download it`)
		}
	})
	req.pipe(busboy)
}

async function download(req, res) {
	const identifier = req.params.identifier
	if (identifier.length == 0) {
		res.send('Empty identifier')
		return
	}
	const files = db.files[identifier]
	if (!files || files.length == 0) {
		res.send('Identifier not found')
		return
	}
	if (files.length === 1) {
		res.download(files[0].path, files[0].name)
	} else {
		res.zip(files, `${identifier}.zip`);
	}
}

module.exports = {
	drop,
	upload,
	download,
}
