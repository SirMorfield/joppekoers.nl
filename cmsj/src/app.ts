import express, { Response } from 'express'
import fs from 'fs'
import { createIPX } from 'ipx'
import path from 'path'
import { env } from './env'
import { generateIndex } from './middlewares/generateIndex'
import { resizeImage } from './middlewares/resize'
import { Project } from './project'
import memoize from 'memoizee'

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

const generateIndexMemoized = env.dev ? generateIndex : memoize(generateIndex, { promise: true, maxAge: 1000 * 60 })
let projects: Promise<Project[]> | Project[] = generateIndexMemoized(env.projects)
app.get('/projects-list', async (_, res) => {
	if (projects instanceof Promise) {
		projects = await projects
	}
	res.json(projects)
	projects = await generateIndexMemoized(env.projects)
})

app.use('/projects', express.static(env.projects))

app.listen(env.port, () => {
	console.log(`listening on: http://localhost:${env.port}`)
	console.log(`reading projects from: ${path.normalize(env.projects)}`)
})
