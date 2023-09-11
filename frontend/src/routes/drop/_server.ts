import { default as fsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'

export const storePath = path.join(FILEPATH, '../../../../static/uploads')

if (!fsSync.existsSync(storePath)) {
	fsSync.mkdirSync(storePath, { recursive: true })
	console.log('Created upload directory', storePath)
}

const fileExists = async path => !!(await fs.stat(path).catch(() => false))

export type File = {
	path: string
	name: string
	id: string
}
export async function getFileById(id: string): Promise<File | undefined> {
	const files = await fs.readdir(storePath)
	const file = files.find(file => file.startsWith(id))
	if (!file) {
		return undefined
	}
	return {
		path: path.join(storePath, file),
		name: file.substring(id.length + 1),
		id,
	}
}

export async function canUploadFile(size: number): Promise<boolean> {
	const maxSize = 10 * 1000 * 1000 * 1000
	// Early return if file is too big
	if (size > maxSize) {
		return false
	}

	const files = await fs.readdir(storePath)
	const stats = await Promise.all(files.map(file => fs.stat(path.join(storePath, file))))
	const totalSize = stats.reduce((acc, current) => acc + current.size, 0)
	return totalSize + size < maxSize
}

export async function getStorePath(file: string, idLength = 4): Promise<File> {
	for (let i = 0; i < 100; i++) {
		const id = Math.random()
			.toString()
			.substring(2, 2 + idLength)
		const filename = `${id}-${file}`
		const filePath = path.join(storePath, filename)
		if (!(await fileExists(filePath))) {
			return {
				path: filePath,
				name: filename,
				id,
			}
		}
	}
	return getStorePath(file, idLength + 1)
}
