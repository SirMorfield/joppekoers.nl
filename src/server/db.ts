import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { promisify } from 'util'
import { exec } from 'child_process'
const env = require(path.join(process.env['root']!, 'configs/env.json'))
const execPromise = promisify(exec)

export interface Db {
	contentDir: string,
	dbFile: string,
	tmpDir: string,
	maxDBSize: number,
	maxFileSize: number,
	files: any
}

function loadDbConfig(): Db {
	if (process.env['NODE_ENV'] == 'production' && (os.hostname()).match(/server1/i)) {
		return env.drop.db
	}
	else {
		return {
			contentDir: path.join(process.env['root']!, 'server/drop/'),
			dbFile: path.join(process.env['root']!, 'server/dropDB.json'),
			tmpDir: '/tmp/',
			maxDBSize: 1.1e+10,
			maxFileSize: 1.074e+9,
			files: {},
		}
	}
}

function initDB(): Db {
	let db: Db = loadDbConfig()

	if (!fs.existsSync(db.contentDir)) fs.mkdirSync(db.contentDir, { recursive: true })
	if (!fs.existsSync(db.tmpDir)) fs.mkdirSync(db.tmpDir, { recursive: true })
	if (!fs.existsSync(db.dbFile)) fs.writeFileSync(db.dbFile, '{}')

	try {
		db.files = JSON.parse((fs.readFileSync(db.dbFile)).toString())
	} catch (err) {
		db.files = {}
		console.error('Failed to read dbFile ', db.dbFile)
	}
	return db
}

function logDBinfo(db: Db) {
	console.log(`/drop`)
	let table: any = {}

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

export let db: Db = initDB()

logDBinfo(db)

export async function DBFull(): Promise<boolean> {
	const { stdout, stderr } = await execPromise(`du -s -B1 '${db.contentDir}'`)
	if (stderr) return true
	return parseInt(stdout.split(' ')[0]!) > db.maxDBSize
}

async function saveDBStatus() {
	await fs.promises.writeFile(db.dbFile, JSON.stringify(db.files))
}

export interface DBFile {
	name: string,
	path: string,
	id: string
}

export async function newFilePath(filename: string): Promise<DBFile | null> {
	if (await DBFull())
		return null
	const id = String(Date.now())
	return {
		name: filename,
		path: path.join(db.contentDir, id),
		id,
	}
}

export async function deleteFile(savePath): Promise<void> {
	if (savePath.indexOf(db.contentDir) == 0) {
		await fs.promises.unlink(savePath)
	}
	for (const identifier in db.files) {
		db.files[identifier] = db.files[identifier].filter((file) => file.savePath != savePath)
	}
	saveDBStatus()
}
