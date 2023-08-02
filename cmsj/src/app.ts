import etag from 'etag'
import express, { Request, Response } from 'express'
import fs from 'fs'
import { createIPX } from 'ipx'
import { hash } from 'ohash'
import path from 'path'
import { env } from './env'
import getImageSize from 'image-size'
import { z } from 'zod'

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

async function fsExists(path: string): Promise<boolean> {
	return !!(await fs.promises.stat(path).catch(() => false))
}

function safeParseJSON<T>(data: string): T | Error {
	try {
		return JSON.parse(data)
	} catch (error) {
		return error as Error
	}
}

type Project = {
	name: string
	images: {
		url: string
		width: number
		height: number
	}[]
}

async function getImageMetaData(path: string): Promise<{ width: number; height: number }> {
	const size = await sizeOf(path)
	if (size instanceof Error) {
		return { width: 0, height: 0 }
	}
	return { width: size.width, height: size.height }
}

function logReq(cache: boolean, path: string, modifiers: unknown) {
	console.log(new Date().toISOString(), 'cache', cache ? 'HIT ' : 'MISS', path, modifiers)
}

const Metadata = z.strictObject({
	name: z.string().nonempty(),
})
type Metadata = z.infer<typeof Metadata>

async function readMetadata(path: string): Promise<Metadata | Error> {
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

async function generateIndex(): Promise<Project[]> {
	const folders = await fs.promises.readdir(env.projects)
	const projects = await Promise.all(
		folders
			.filter((file: string) => {
				if (file.startsWith('.')) {
					return false
				}
				return fs.statSync(path.join(env.projects, file)).isDirectory()
			})
			.sort((a: string, b: string) => (a > b ? 1 : -1))
			.map(async (file: string) => {
				const paths = await fs.promises.readdir(path.join(env.projects, file))
				const imagePaths = paths.filter(file => file !== 'metadata.json' && !file.includes('ignore'))

				const images = await Promise.all(
					imagePaths.map(async (image: string) => ({
						url: new URL(`/projects/${file}/${image}`, env.cmsUrl).toString(),
						...(await getImageMetaData(path.join(env.projects, file, image))),
					})),
				)
				const metadataPath = paths.find(file => file === 'metadata.json')
				const metadata = metadataPath ? await readMetadata(path.join(env.projects, file, metadataPath)) : {}
				if (metadata instanceof Error) {
					console.error('project', file, 'has incorrect metadata:', metadata.message)
				}
				return {
					name: file,
					images,
					...(metadata instanceof Error ? {} : metadata),
				}
			}),
	)
	return projects.filter(project => project.images.length > 0)
}

if (!fs.existsSync(env.cacheDir)) {
	fs.mkdirSync(env.cacheDir, { recursive: true })
}

const ipx = createIPX({
	dir: env.projects,
	maxAge: env.maxAge,
})

// inspired by https://github.com/strapi-community/strapi-plugin-local-image-sharp
async function createMiddleware(req: Request, res: Response) {
	if (req.path === '/') {
		res.sendStatus(404)
		return
	}
	const objectHash = hash({ id: req.path, ...req.query })
	const tmpFilePath = path.join(env.cacheDir, `${objectHash}.raw`)
	const tmpTypePath = path.join(env.cacheDir, `${objectHash}.mime`)
	const tmpEtagPath = path.join(env.cacheDir, `${objectHash}.etag`)

	if (await fsExists(tmpFilePath)) {
		try {
			const [type, etag] = await Promise.all([
				fs.promises.readFile(tmpTypePath, 'utf-8'),
				fs.promises.readFile(tmpEtagPath, 'utf-8'),
			])

			res.set('ETag', etag)
			if (etag && req.headers['if-none-match'] === etag) {
				res.sendStatus(304)
				return
			}

			res.set('Cache-Control', `max-age=${env.maxAge}, public, s-maxage=${env.maxAge}`)

			if (type) {
				res.set('Content-Type', type)
			}

			const stream = fs.createReadStream(tmpFilePath)
			stream.pipe(res)
			logReq(true, req.path, req.query)
			return
		} catch (error) {
			console.error(new Error(error as string))
		}
	}

	const img = ipx(req.path, req.query)
	try {
		const src = await img.src()

		// Caching headers
		if (src.mtime) {
			if (req.headers['if-modified-since']) {
				if (new Date(req.headers['if-modified-since']) >= src.mtime) {
					res.sendStatus(304)
					return
				}
			}
			res.set('Last-Modified', `${+src.mtime}`)
		}

		const maxAge = src.maxAge ?? env.maxAge
		res.set('Cache-Control', `max-age=${maxAge}, public, s-maxage=${maxAge}`)

		// Get converted image
		const { data, format } = await img.data()
		const etagV = etag(data)
		if (etagV && req.headers['if-none-match'] === etagV) {
			res.sendStatus(304)
			return
		}
		res.set('Content-Type', `image/${format}`)
		res.set('ETag', etagV)
		res.send(data)
		logReq(false, req.path, req.query)

		void Promise.all([
			fs.promises.writeFile(tmpTypePath, `image/${format}`, 'utf-8'),
			fs.promises.writeFile(tmpEtagPath, etagV, 'utf-8'),
			fs.promises.writeFile(tmpFilePath, data),
		]).catch(error => {
			console.error(new Error(error))
		})
	} catch (error) {
		console.log('err', new Error(error as string))
		res.sendStatus(500)
		// @ts-ignore
		res.send(error.message ?? error)
	}
}

const app = express()
app.use('/projects', createMiddleware)
app.get('/projects-list', async (_, res) => {
	const projects = await generateIndex()
	res.json(projects)
})

app.use('/projects', express.static(env.projects))

app.listen(env.port, () => {
	console.log(`http://localhost:${env.port}`)
	console.log(env.projects)
})
