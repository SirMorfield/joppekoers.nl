import path from 'path'
import { default as fs } from 'fs/promises'
import type { PathLike } from 'fs'

export const storePath = path.join(process.cwd(), 'static/uploads')

const fileExists = async path => !!(await fs.stat(path).catch(_ => false))

export type File = {
	path: PathLike
	name: string
}
export async function getFileById(id: string): Promise<File | undefined> {
	const files = await fs.readdir(storePath)
	const file = files.find(file => file.startsWith(id))
	if (!file) {
		return undefined
	}
	return {
		path: path.join(storePath, file),
		name: file.substring(id.length),
	}
}

export async function getStorePath(file: string, idLength = 4): Promise<string> {
	for (let i = 0; i < 100; i++) {
		const filename = `${Math.random().toString().substring(2, 6)}${file}`
		const filePath = path.join(storePath, filename)
		if (!(await fileExists(filePath))) {
			return filePath
		}
	}
	return getStorePath(file, idLength + 1)
}

export function readableToReadStream(readable: ReadStream): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			readable.addListener('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
			readable.addListener('end', () => controller.close())
			readable.addListener('error', err => controller.error(err))
		},
	})
}
