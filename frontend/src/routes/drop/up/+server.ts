import fs from 'fs/promises'
import { fail } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getStorePath } from '../_server'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { file } = Object.fromEntries(await request.formData())
		if (!(file instanceof File)) {
			throw fail(400, { err: 'Invalid form data, expected file' })
		}

		const filePath = await getStorePath(file.name)
		await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))
		return new Response(JSON.stringify({ path: filePath }))
	} catch (err) {
		throw fail(500, { err })
	}
}
