import * as fs from 'fs'
import * as db from '../server/db'

const Busboy = require('busboy')

export function drop(req, res) {
	res.render('drop.ejs')
}

export async function upload(req, res) {
	let busboy = new Busboy({ headers: req.headers })
	let files: db.DBFile[] = []

	busboy.on('file', async (fieldName, stream, filename, encoding, mimetype) => {
		let file = await db.newFilePath(filename)
		if (!file) {
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

		const userAgent = (req.get('user-agent')).toLowerCase()
		if (userAgent.includes('curl') || userAgent.includes('wget')) {
			res.send(`joppekoers.nl/drop/${files[0].id}`)
		}
		else {
			res.send(`Done, go to <b>joppekoers.nl/drop/${files[0].id}</b> to download it`)
		}
	})
	req.pipe(busboy)
}

export async function download(req, res) {
	const identifier = req.params.identifier
	if (identifier.length == 0) {
		res.send('Empty identifier')
		return
	}
	const files: db.DBFile[] = db.db.files[identifier]!
	if (!files || files.length == 0) {
		res.send('Identifier not found')
		return
	}
	if (files.length === 1) {
		res.download(files[0].path, files[0].name)
	}
	else {
		res.zip(files, `${identifier}.zip`);
	}
}
