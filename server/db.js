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

let db = {}
if (process.env.NODE_ENV == 'production') {
	Object.assign(db, env.drop.db)
} else {
	db = {
		contentDir: path.join(process.env.root, 'server/drop'),
		tmpDir: '/tmp/',
		dbFile: path.join(process.env.root, 'server/dropDB.json'),
		maxDBSize: 1.1e+10,
		maxFileSize: 1.074e+9,
	}
	if (!fs.existsSync(db.contentDir)) fs.mkdirSync(db.contentDir)
	if (!fs.existsSync(db.dbFile)) fs.writeFileSync(db.dbFile, '{}')
}
db.info = require(db.dbFile)

async function DBFull(newFile) {
	const { stdout, stderr } = await exec(`du -s -B1 '${db.contentDir}'`)
	if (stderr) return true
	const newSize = parseInt(stdout.split(' ')[0]) + newFile
	return newSize > db.maxDBSize
}

async function getSavePath(identifier, filename, fileSize) {
	if (await DBFull(fileSize))
		return { error: 'Database is full' }
	if (db.info[identifier])
		return { error: 'Identifier already in use' }
	const saveName = `${timestamp(new Date())}${filename.match(/\.[0-9a-z]+$/i)[0]}`
	db.info[identifier] = [
		{
			path: path.join(db.contentDir, saveName),
			name: filename,
			size: fileSize,
		}
	]
	await fs.promises.writeFile(db.dbFile, JSON.stringify(db.info))
	return db.info[identifier][0].path
}

const fileUploadSettings = {
	limits: { fileSize: db.maxFileSize },
	abortOnLimit: true,
	useTempFiles: true,
	tempFileDir: db.tmpDir
}

const fileUpload = require('express-fileupload')
module.exports = {
	...db,
	getSavePath,
	fileUpload: fileUpload(fileUploadSettings)
}
