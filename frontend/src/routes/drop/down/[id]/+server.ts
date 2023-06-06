import type { RequestHandler } from '@sveltejs/kit'
import { storePath } from '../../_server'
import fs from 'fs/promises'

import type { PathLike, ReadStream } from 'fs'
import path from 'path'

type File = {
	path: PathLike
	name: string
}
async function getFileById(id: string): Promise<File | undefined> {
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

function readableToReadStream(readable: ReadStream): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			readable.addListener('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
			readable.addListener('end', () => controller.close())
			readable.addListener('error', err => controller.error(err))
		},
	})
}

export const GET: RequestHandler = async ({ setHeaders, params }) => {
	const id = params.id
	const file = await getFileById(id)
	if (!file) {
		return new Response('File not found', { status: 404 })
	}

	setHeaders({
		'Content-Disposition': `attachment; filename=${file.name}`,
	})
	const fp = await fs.open(file.path)
	const stream = readableToReadStream(fp.createReadStream())
	return new Response(stream, { status: 200 })
}
