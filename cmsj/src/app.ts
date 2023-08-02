import etag from 'etag'
import express, { Request, Response } from 'express'
import fs from 'fs'
import { createIPX } from 'ipx'
import { hash } from 'ohash'
import path from 'path'
import { env } from './env'

async function fsExists(path: string): Promise<boolean> {
	return !!(await fs.promises.stat(path).catch(() => false))
}

type Project = {
	name: string
	images: string[]
}

const opt = {
	dir: `${__dirname}/../projects`,
	maxAge: 60 * 60 * 24 * 100,
} as const

async function generateIndex(): Promise<Project[]> {
	const files = await fs.promises.readdir(opt.dir)

	const projects = files
		.filter((file: string) => {
			return fs.statSync(path.join(opt.dir, file)).isDirectory()
		})
		.sort((a: string, b: string) => (a > b ? 1 : -1))
		.map((file: string) => {
			const images = fs
				.readdirSync(path.join(opt.dir, file))
				.map((image: string) => new URL(`/image/_/${file}/${image}`, env.cmsUrl).toString())
			return {
				name: file,
				images,
			}
		})
	return projects
}

if (!fs.existsSync(env.cacheDir)) {
	fs.mkdirSync(env.cacheDir, { recursive: true })
}

const ipx = createIPX(opt)

// inspired by https://github.com/strapi-community/strapi-plugin-local-image-sharp
async function createMiddleware(req: Request, res: Response) {
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
app.get('/project-index', async (_, res) => {
	const projects = await generateIndex()
	res.json(projects)
})

app.use('/projects', express.static(opt.dir))

app.listen(env.port, () => {
	console.log(`http://localhost:${env.port}`)
	console.log(opt.dir)
})
