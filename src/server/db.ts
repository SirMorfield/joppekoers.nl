import * as path from 'path'
import * as fs from 'fs'
import { exec } from 'child_process'
import { PathLike } from 'node:fs'
const env = require(path.join(process.env['root']!, 'configs/env.json'))

async function execAsync(command): Promise<{ stdout: string, stderr: string }> {
	return new Promise((resolve, reject) => {
		exec(`${command}`, (error, stdout, stderr) => {
			resolve({ stdout, stderr })
		})
	})
}

export interface DBFile {
	name: string,
	path: PathLike,
	id: string
}

export interface Db {
	contentDir: string,
	dbFile: string,
	tmpDir: string,
	maxDBSize: number,
	maxFileSize: number,
	files: DBFile[]
}

function initDB(): Db {
	let db: Db = env.drop.db

	if (!db.contentDir || !db.dbFile || !db.maxDBSize || !db.maxFileSize)
		console.error('Missing DB options in env file')
	try {
		if (!fs.existsSync(db.contentDir)) fs.mkdirSync(db.contentDir, { recursive: true })
		if (!fs.existsSync(db.tmpDir)) fs.mkdirSync(db.tmpDir, { recursive: true })
		if (!fs.existsSync(db.dbFile)) fs.writeFileSync(db.dbFile, '[]')
	} catch (err) {
		console.error('Cannot create db directories:', err)
	}

	try {
		db.files = JSON.parse((fs.readFileSync(db.dbFile)).toString())
	} catch (err) {
		db.files = []
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

	table.tmpDir = db.tmpDir
	table.dbFile = db.dbFile
	console.table(table)
}

const db: Db = initDB()

logDBinfo(db)

export async function DBFull(): Promise<boolean> {
	const { stdout, stderr } = await execAsync(`du -s -B1 '${db.contentDir}'`)
	if (stderr) return true
	return parseInt(stdout.split(' ')[0]!) > db.maxDBSize
}

async function saveDBStatus() {
	await fs.promises.writeFile(db.dbFile, JSON.stringify(db.files))
}

function randomNumber(length: number): string {
	let table = '0123456789'
	let text = ''
	while (length-- > 0)
		text += table.charAt(Math.round(Math.random() * (table.length - 1)))
	return text
}

const reserved: string[] = []
export function newID(): string {
	let len = 4
	let loops = 0
	let exists
	let id
	do {
		exists = false
		id = randomNumber(len)
		for (const file of db.files) {
			if (file.id == id) {
				exists = true
				break
			}
		}
		loops++
		if (loops == 100) {
			loops = 0
			len++
		}
	} while (exists || reserved.includes(id))
	reserved.push(id)
	return id
}

export async function newDBFile(filename: string, id: string): Promise<DBFile | null> {
	if (await DBFull())
		return null

	const dbFIle = {
		name: filename,
		path: path.join(db.contentDir, randomNumber(32)),
		id,
	}
	db.files.push(dbFIle)
	saveDBStatus()
	return dbFIle
}

export function getFilesByID(id: string): DBFile[] {
	return db.files.filter((file) => file.id === id)
}

export async function deleteFile(savePath): Promise<void> {
	if (savePath.indexOf(db.contentDir) == 0) {
		await fs.promises.unlink(savePath)
	}
	db.files = db.files.filter((file) => file.path != savePath)
	await saveDBStatus()
}
