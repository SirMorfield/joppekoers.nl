import etag from 'etag'
import { Request, Response } from 'express'
import fs from 'fs'
import { IPX } from 'ipx'
import { hash } from 'ohash'
import path from 'path'
import { sendError } from '../app'
import { env } from '../env'
import { exceptionAsValue, fsExists } from '../util'

function logReq(cache: boolean, path: string, modifiers: unknown) {
	console.log(new Date().toISOString(), 'cache', cache ? 'HIT ' : 'MISS', path, modifiers)
}
// inspired by https://github.com/strapi-community/strapi-plugin-local-image-sharp
export async function resizeImage(ipx: IPX, req: Request, res: Response) {
	if (req.path === '/') {
		res.sendStatus(404)
		return
	}
	const imageHash = hash({ id: req.path, ...req.query })
	const imgPath = path.join(env.cacheDir, `${imageHash}.raw`)
	const typePath = path.join(env.cacheDir, `${imageHash}.mime`)
	const etagPath = path.join(env.cacheDir, `${imageHash}.etag`)

	if (await fsExists(imgPath)) {
		const [type, etag] = await Promise.all([
			fs.promises.readFile(typePath, 'utf-8').catch(e => e as Error),
			fs.promises.readFile(etagPath, 'utf-8').catch(e => e as Error),
		])
		if (type instanceof Error || etag instanceof Error) {
			return console.error('Could not read meta', (type ?? etag) as Error)
		}

		res.set('ETag', etag)
		if (etag && req.header('if-none-match') === etag) {
			return res.sendStatus(304)
		}

		res.set('Cache-Control', `max-age=${env.maxAge}, public, s-maxage=${env.maxAge}`)

		res.set('Content-Type', type)

		const stream = fs.createReadStream(imgPath)
		stream.pipe(res)
		logReq(true, req.path, req.query)
		return
	}

	const img = exceptionAsValue(() => ipx(req.path, req.query))
	if (img instanceof Error) {
		return sendError(img, res)
	}
	const src = await exceptionAsValue(() => img.src())
	if (src instanceof Error) {
		return sendError(src, res)
	}

	// Caching headers
	if (src.mtime) {
		const ifModifiedSince = req.header('if-modified-since')
		if (ifModifiedSince && new Date(ifModifiedSince) >= src.mtime) {
			return res.sendStatus(304)
		}
		res.set('Last-Modified', `${src.mtime}`)
	}

	const maxAge = src.maxAge ?? env.maxAge
	res.set('Cache-Control', `max-age=${maxAge}, public, s-maxage=${maxAge}`)

	// Get converted image
	const data = await exceptionAsValue(() => img.data())
	if (data instanceof Error) {
		return sendError(data, res)
	}
	const etagV = etag(data.data)
	if (etagV && req.header('if-none-match') === etagV) {
		res.sendStatus(304)
		return
	}
	res.set('Content-Type', `image/${data.format}`)
	res.set('ETag', etagV)
	res.send(data)
	logReq(false, req.path, req.query)

	void Promise.all([
		fs.promises.writeFile(typePath, `image/${data.format}`, 'utf-8'),
		fs.promises.writeFile(etagPath, etagV, 'utf-8'),
		fs.promises.writeFile(imgPath, data.data),
	]).catch(error => {
		console.error(new Error(error))
	})
}
