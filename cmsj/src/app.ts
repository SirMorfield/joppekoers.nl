import etag from 'etag'
import express, { Request, Response } from 'express'
import fs from 'fs'
import { createIPX } from 'ipx'
import { hash } from 'ohash'
import path from 'path'
import { env } from './env'
import exifr from 'exifr'

async function fsExists(path: string): Promise<boolean> {
	return !!(await fs.promises.stat(path).catch(() => false))
}

type Project = {
	name: string
	images: {
		url: string
		width: number
		height: number
	}[]
}

const opt = {
	dir: `${__dirname}/../projects`,
	maxAge: 60 * 60 * 24 * 100,
} as const

async function exif(path: string): Promise<{ width: number; height: number }> {
	const d = await exifr.parse(path).catch(() => undefined)
	return { width: d?.ImageWidth ?? 0, height: d?.ImageHeight ?? 0 }
}

function logReq(cache: boolean, path: string, modifiers: unknown) {
	console.log(new Date().toISOString(), 'cache', cache ? 'HIT ' : 'MISS', path, modifiers)
}

async function generateIndex(): Promise<Project[]> {
	const folders = await fs.promises.readdir(opt.dir)
	return Promise.all(
		folders
			.filter((file: string) => {
				if (file.startsWith('.')) {
					return false
				}
				return fs.statSync(path.join(opt.dir, file)).isDirectory()
			})
			.sort((a: string, b: string) => (a > b ? 1 : -1))
			.map(async (file: string) => {
				const paths = await fs.promises.readdir(path.join(opt.dir, file))
				const images = await Promise.all(
					paths.map(async (image: string) => ({
						url: new URL(`/projects/${file}/${image}`, env.cmsUrl).toString(),
						...(await exif(path.join(opt.dir, file, image))),
					})),
				)
				return {
					name: file,
					images,
				}
			}),
	)
}

if (!fs.existsSync(env.cacheDir)) {
	fs.mkdirSync(env.cacheDir, { recursive: true })
}

const ipx = createIPX(opt)

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
			logReq(true, req.path, req.query)
			stream.pipe(res)
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

		if (maxAge) {
			res.set('Cache-Control', `max-age=${maxAge}, public, s-maxage=${maxAge}`)
		}

		// Get converted image
		const { data, format } = await img.data()
		const etagV = etag(data)

		void Promise.all([
			fs.promises.writeFile(tmpTypePath, `image/${format}`, 'utf-8'),
			fs.promises.writeFile(tmpEtagPath, etagV, 'utf-8'),
			fs.promises.writeFile(tmpFilePath, data),
		]).catch(error => {
			console.error(new Error(error))
		})

		res.set('ETag', etagV)
		if (etagV && req.headers['if-none-match'] === etagV) {
			res.sendStatus(304)
			return
		}

		if (format) {
			res.set('Content-Type', `image/${format}`)
		}
		logReq(false, req.path, req.query)
		res.send(data)
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

app.use('/projects', express.static(opt.dir))

app.listen(env.port, () => {
	console.log(`http://localhost:${env.port}`)
	console.log(opt.dir)
})
