import path from 'path'
import fs from 'fs/promises'
import { fail } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { storePath } from '../_server'

const fileExists = async path => !!(await fs.stat(path).catch(_ => false))

async function getStorePath(file: string, idLength = 4): Promise<string> {
	for (let i = 0; i < 100; i++) {
		const filename = `${Math.random().toString().substring(2, 6)}${file}`
		const filePath = path.join(storePath, filename)
		if (!(await fileExists(filePath))) {
			return filePath
		}
	}
	return getStorePath(file, idLength + 1)
}

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
