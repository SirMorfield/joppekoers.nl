import fs from 'fs/promises'
import type { RequestHandler } from './$types'
import { canUploadFile, getStorePath } from '../_server'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { file } = Object.fromEntries(await request.formData())
		if (!(file instanceof File)) {
			return new Response('Invalid form data, expected file', { status: 400 })
		}
		if (!(await canUploadFile(file.size))) {
			return new Response('No room on disk or file too big', { status: 400 })
		}

		const storedFile = await getStorePath(file.name)
		await fs.writeFile(storedFile.path, Buffer.from(await file.arrayBuffer()))
		return new Response(`https://joppekoers.nl/drop/${storedFile.id}`)
	} catch (err) {
		return new Response(`Internal server error: ${err}`, { status: 500 })
	}
}
