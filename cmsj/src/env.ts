import { z } from 'zod'

const Env = z.object({
	dev: z.boolean(),
	port: z.number().min(0).max(65535),
	cmsUrl: z.string().url(),
	projects: z.string(),
	cacheDir: z.string(),
	maxAge: z.number().min(0),
})
export type Env = z.infer<typeof Env>

const dev = process.env['NODE_ENV'] === 'development'
const port = Number(process.env['PORT']) || 8080
export const env = {
	dev,
	port,
	cmsUrl: dev ? `http://127.0.0.1:${port}` : 'https://cms.joppekoers.nl',
	projects: `${__dirname}/../projects`,
	cacheDir: `${__dirname}/../projects/.cache`,
	maxAge: 60 * 60 * 24 * 100,
} as const satisfies Env

Env.parse(env)
