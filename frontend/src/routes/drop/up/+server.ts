import path from 'path'
import fs from 'fs/promises'
import { fail } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const storePath = path.join(process.cwd(), 'static/uploads')
const fileExists = async path => !!(await fs.stat(path).catch(_ => false))

async function getStorePath(file: string, idLength = 4): Promise<string> {
	for (let i = 0; i < 100; i++) {
		const filename = `${Math.random().toString().substring(2, 6)}.${file}`
		const filePath = path.join(storePath, filename)
		if (!(await fileExists(filePath))) {
			return filePath
		}
	}
	return getStorePath(file, idLength + 1)
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = Object.fromEntries(await request.formData())
		const blob = data.file
		if (!(blob instanceof File)) {
			throw fail(400, { err: 'Invalid form data, expected file' })
		}
		const name = blob.name

		const filePath = await getStorePath(name)
		await fs.writeFile(filePath, Buffer.from(await blob.arrayBuffer()))
		return new Response(JSON.stringify({ path: filePath }))
	} catch (err) {
		console.log(err)
		throw fail(500, { err: err })
	}
}
