import type { RequestHandler } from '@sveltejs/kit'
import { getFileById } from '../_server'
import { z } from 'zod'

export const GET: RequestHandler = async ({ setHeaders, params }) => {
	const id = await z.string().min(1).safeParseAsync(params.id)
	if (!id.success) {
		return new Response('Invalid file id', { status: 400 })
	}
	const file = await getFileById(id.data)
	if (!file) {
		return new Response('File not found', { status: 404 })
	}

	setHeaders({
		'Content-Disposition': `attachment; filename=${file.name}`,
	})
	const fp = Bun.file(file.path.toString())
	return new Response(fp.stream(), { status: 200 })
}
