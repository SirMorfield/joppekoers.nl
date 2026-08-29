import getImageSize from 'image-size'
import { z } from 'zod'
import { safeParseJSON } from './util'
import fs from 'fs'
import path from 'path'
import { env } from './env'

function sizeOf(path: string): Promise<{ height: number; width: number; type: string } | Error> {
	return new Promise(resolve => {
		getImageSize(path, (err, dimensions) => {
			if (err) {
				return resolve(err)
			}
			if (!dimensions || !dimensions.width || !dimensions.height || !dimensions.type) {
				return resolve(new Error(`No dimensions or type: ${JSON.stringify(dimensions)}`))
			}

			resolve({
				width: dimensions.width,
				height: dimensions.height,
				type: dimensions.type,
			})
		})
	})
}

export type Project = {
	name: string
	images: {
		url: string
		width: number
		height: number
	}[]
}

export async function getImageMetaData(path: string): Promise<{ width: number; height: number }> {
	const size = await sizeOf(path)
	if (size instanceof Error) {
		return { width: 0, height: 0 }
	}
	return { width: size.width, height: size.height }
}

const Metadata = z.strictObject({
	name: z.string().nonempty(),
})
type Metadata = z.infer<typeof Metadata>

export async function readMetadata(path: string): Promise<Metadata | Error> {
	const data = await fs.promises.readFile(path, 'utf-8').catch(error => error)
	if (data instanceof Error) {
		return data
	}
	const json = safeParseJSON<Metadata>(data)
	if (json instanceof Error) {
		return json
	}
	const parse = await Metadata.safeParseAsync(json)
	return parse.success ? parse.data : parse.error
}

export async function dirToProject(dir: string): Promise<Project> {
	const paths = await fs.promises.readdir(path.join(env.projects, dir))
	const imagePaths = paths.filter(file => file !== 'metadata.json' && !file.includes('ignore'))

	const images = await Promise.all(
		imagePaths.map(async (image: string) => ({
			url: `/projects/${dir}/${image}`,
			...(await getImageMetaData(path.join(env.projects, dir, image))),
		})),
	)
	const metadataPath = paths.find(file => file === 'metadata.json')
	const metadata = metadataPath ? await readMetadata(path.join(env.projects, dir, metadataPath)) : {}
	if (metadata instanceof Error) {
		console.error('project', dir, 'has incorrect metadata:', metadata.message)
	}
	return {
		name: dir,
		images,
		...(metadata instanceof Error ? {} : metadata),
	}
}
