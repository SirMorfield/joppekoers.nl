import * as fs from 'fs'
import * as db from '../server/db'

const Busboy = require('busboy')

export function drop(req, res) {
	res.render('drop.ejs')
}

export async function upload(req, res) {
	let busboy = new Busboy({ headers: req.headers })
	let nFilesUploaded = 0
	const id = db.newID()

	busboy.on('file', async (fieldName, stream, filename, encoding, mimetype) => {
		let file = await db.newDBFile(filename, id)
		if (!file) {
			stream.resume() // aka stream.close()
			return
		}
		nFilesUploaded++
		stream.pipe(fs.createWriteStream(file.path))
		// stream.on('end', () => { })
	})

	busboy.on('finish', () => {
		if (nFilesUploaded == 0) {
			res.send('No files uploaded')
			return
		}

		const userAgent = req.get('user-agent').toLowerCase()
		if (userAgent.includes('curl') || userAgent.includes('wget')) {
			res.send(`joppekoers.nl/drop/${id}`)
		} else {
			res.send(`Done, go to <b>joppekoers.nl/drop/${id}</b> to download it`)
		}
	})
	req.pipe(busboy)
}

export async function download(req, res) {
	const id = req.params.identifier
	if (id.length == 0) {
		res.send('Empty identifier')
		return
	}
	const files = db.getFilesByID(id)
	if (files.length == 0) {
		res.send('Identifier not found!')
		return
	}
	if (files.length === 1) {
		res.download(files[0]!.path, files[0]!.name)
	} else {
		res.zip({
			files: files.map((file) => {
				return { path: file.path, name: file.name }
			}),
			filename: `${id}.zip`,
		})
	}
}
