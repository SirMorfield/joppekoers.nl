import { dev } from '$app/environment'
import { z } from 'zod'

export const env = {
	cmsUrl: dev ? 'http://127.0.0.1:1337' : 'https://cms.joppekoers.nl',
	// cmsUrl: 'https://cms.joppekoers.nl', // temporary override
} as const satisfies Env

const Env = z.object({
	cmsUrl: z.string().url(),
})
export type Env = z.infer<typeof Env>
Env.parse(env)
