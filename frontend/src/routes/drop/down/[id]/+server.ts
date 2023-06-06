import type { RequestHandler } from '@sveltejs/kit'
import fs from 'fs/promises'
import { getFileById, readableToReadStream } from '../../_server'

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
