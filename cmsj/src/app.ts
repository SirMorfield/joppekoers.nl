import express, { Response } from 'express'
import fs from 'fs'
import { createIPX } from 'ipx'
import path from 'path'
import { env } from './env'
import { generateIndex } from './middlewares/generateIndex'
import { resizeImage } from './middlewares/resize'

export function sendError(err: Error, res: Response) {
	console.error(err)
	res.status(500)
	res.send(err.message)
}

if (!fs.existsSync(env.cacheDir)) {
	fs.mkdirSync(env.cacheDir, { recursive: true })
}

const ipx = createIPX({
	dir: env.projects,
	maxAge: env.maxAge,
})

const app = express()
app.get('/', (_, res) => res.send('CMS is running'))
app.use('/projects', (req, res) => {
	resizeImage(ipx, req, res)
})
app.get('/projects-list', async (_, res) => {
	const projects = await generateIndex(env.projects)
	res.json(projects)
})

app.use('/projects', express.static(env.projects))

app.listen(env.port, () => {
	console.log(`listening on: http://localhost:${env.port}`)
	console.log(`reading projects from: ${path.normalize(env.projects)}`)
})
