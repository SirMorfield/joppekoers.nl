const fs = require('fs')
const path = require('path')
const env = require(path.join(process.env.root, 'configs/env.json'))
const exec = require('util').promisify(require('child_process').exec)
const os = require('os')

function timestamp(d) {
	const date = d.toISOString().split('T')[0]
	const time = d.toTimeString().split(' ')[0]
	const ms = `${d.getMilliseconds()}`.padStart(3, '0')
	return `${date} ${time}:${ms}`.replace(/\:/g, '.')
}

function initDB() {
	let db = {}
	if (process.env.NODE_ENV == 'production' && (os.hostname()).match(/server1/i)) {
		Object.assign(db, env.drop.db)
	} else {
		db = {
			contentDir: path.join(process.env.root, 'server/drop/'),
			dbFile: path.join(process.env.root, 'server/dropDB.json'),
			tmpDir: '/tmp/',
			maxDBSize: 1.1e+10,
			maxFileSize: 1.074e+9,
		}
		if (!fs.existsSync(db.contentDir)) fs.mkdirSync(db.contentDir, { recursive: true })
	}
	if (!fs.existsSync(db.dbFile)) {
		fs.writeFileSync(db.dbFile, '{}')
	}
	try {
		db.files = JSON.parse((fs.readFileSync(db.dbFile)).toString())
	} catch (err) {
		console.error('Failed to read dbFile ', db.dbFile)
	}
	return db
}

let db = initDB()

function logDBinfo(db) {
	console.log(`/drop`)
	let table = {}

	table.contentDir = db.contentDir
	try {
		table.filesSaved = (fs.readdirSync(db.contentDir)).length
	} catch (err) {
		table.filesSaved = `Error reading contentDir`
	}
	table.filesInDBfile = 0
	for (const identifier in db.files) {
		table.filesInDBfile += db.files[identifier].length
	}
	table.tmpDir = db.tmpDir
	table.dbFile = db.dbFile
	console.table(table)
}

logDBinfo(db)

async function DBFull() {
	const { stdout, stderr } = await exec(`du -s -B1 '${db.contentDir}'`)
	if (stderr) return true
	return parseInt(stdout.split(' ')[0]) > db.maxDBSize
}

async function saveDBStatus() {
	await fs.promises.writeFile(db.dbFile, JSON.stringify(db.files))
}

function addToDb(files) {
	let n = 4
	let id
	do {
		id = `${Date.now()}`.slice(-Math.round(n))
		n += 0.001
	} while (db.files[id])
	db.files[id] = files
	saveDBStatus()
	return id
}

async function newFilePath() {
	if (await DBFull()) {
		return null
	}
	return path.join(db.contentDir, `${Date.now()}`)
}

async function deleteFile(savePath) {
	if (savePath.indexOf(db.contentDir) == 0) {
		await fs.promises.unlink(savePath)
	}
	for (const identifier in db.files) {
		db.files[identifier] = db.files[identifier].filter((file) => file.savePath != savePath)
	}
	saveDBStatus()
}

module.exports = {
	files: db.files,
	addToDb,
	newFilePath,
	deleteFile
}
