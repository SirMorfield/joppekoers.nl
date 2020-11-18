const fs = require('fs')
const path = require('path')
const env = require(path.join(process.env.root, 'configs/env.json'))
const exec = require('util').promisify(require('child_process').exec)

function timestamp(d) {
	const date = d.toISOString().split('T')[0]
	const time = d.toTimeString().split(' ')[0]
	const ms = `${d.getMilliseconds()}`.padStart(3, '0')
	return `${date} ${time}:${ms}`.replace(/\:/g, '.')
}

function logDB(name, testPath) {
	if (!fs.existsSync(testPath)) {
		console.log(`${name} ${testPath} does not exist`)
		return 1
	} else {
		console.log(`${name} ${testPath}`)
		return 0
	}
}

let db = {}
if (process.env.NODE_ENV == 'production') {
	Object.assign(db, env.drop.db)
} else {
	db = {
		contentDir: path.join(process.env.root, 'server/drop'),
		tmpDir: '/tmp/',
		maxDBSize: 1.1e+10,
		maxFileSize: 1.074e+9,
	}
	if (!fs.existsSync(db.contentDir)) fs.mkdirSync(db.contentDir)
}
let er = 0
console.log(`/drop`)
er += logDB(`  contentDir`, db.contentDir)
er += logDB(`  tmpDir    `, db.tmpDir)
if (er == 0) {
	console.log(`  files     `, `${(fs.readdirSync(db.contentDir)).length}`)
}
console.log('')

async function DBFull(newFile) {
	const { stdout, stderr } = await exec(`du -s -B1 '${db.contentDir}'`)
	if (stderr) return true
	const newSize = parseInt(stdout.split(' ')[0]) + newFile
	return newSize > db.maxDBSize
}

function validateIdentifier(dbContents, identifier) {
	if (identifier.length == 0) {
		return { error: 'Identifier too short' }
	}
	if (identifier.length > 254) {
		return { error: 'Identifier too long' }
	}
	if (identifier.match(/[^\w\d]/)) {
		return { error: 'Invalid identifier, only use letters and numbers' }
	}
	for (const file of dbContents) {
		if (file.match(/^[\w\d]*-/) == `${identifier}-`) {
			return { error: 'Identifier already in use' }
		}
	}
	return { error: null }
}

function getSavePath(dbContents, identifier, filename) {
	let n = 0
	let dbFilename
	do {
		dbFilename = `${identifier}-${n}-${filename}`
		n++
	} while (dbContents.includes(filename))
	return path.join(db.contentDir, dbFilename)
}

async function saveFiles(files, identifier) {
	const totalFileSize = files.reduce((acc, cur) => cur.size + acc)
	if (await DBFull(totalFileSize)) {
		return { error: 'Database is full' }
	}
	const dbContents = await fs.promises.readdir(db.contentDir)
	const validIdentifier = validateIdentifier(dbContents, identifier)
	if (validIdentifier.error) return validIdentifier

	for (const file of files) {
		const dbPath = getSavePath(dbContents, identifier, file.name)
		try {
			await file.mv(dbPath)
		} catch (err) {
			return { error: `Failed to save file "${file.name}"` }
		}
	}
	return { error: null }
}

async function getFiles(identifier) {
	let files = await fs.promises.readdir(db.contentDir)
	files = files.filter(file => file.match(/^[\w\d]*-/) == `${identifier}-`)
	files = files.map((file) => {
		return {
			path: path.join(db.contentDir, file),
			name: file.replace(/^[\w\d]*-\d*-/, '')
		}
	})
	return files
}

const fileUploadSettings = {
	limits: { fileSize: db.maxFileSize },
	abortOnLimit: true,
	useTempFiles: true,
	tempFileDir: db.tmpDir,
	preserveExtension: true,
	saveFileNames: true
}

const fileUpload = require('express-fileupload')
const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants')
module.exports = {
	...db,
	saveFiles,
	getFiles,
	fileUpload: fileUpload(fileUploadSettings)
}
