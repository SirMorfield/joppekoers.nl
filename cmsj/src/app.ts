import { IPXOptions, createIPX, createIPXMiddleware } from 'ipx'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { env } from './env'

type Project = {
	name: string
	images: string[]
}

const opt = {
	dir: `${__dirname}/../projects`,
	maxAge: 60 * 60 * 24 * 100,
} as const satisfies Partial<IPXOptions>

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

const ipx = createIPX(opt)
const app = express()
app.use('/image', createIPXMiddleware(ipx))
app.get('/project-index', async (_, res) => {
	const projects = await generateIndex()
	res.json(projects)
})

app.use('/projects', express.static(opt.dir))

app.listen(env.port, () => {
	console.log(`http://localhost:${env.port}`)
	console.log(opt.dir)
})
