import { dev } from '$app/environment'
import { z } from 'zod'

export const env = {
	privateCmsUrl: dev ? 'http://127.0.0.1:1337' : 'http://cms:1337',
	publicCmsUrl: dev ? 'http://127.0.0.1:1337' : 'https://cms.joppekoers.nl',
	// publicCmsUrl: 'http://127.0.0.1:1337',
} as const satisfies Env

const Env = z.object({
	privateCmsUrl: z.string().url(),
	publicCmsUrl: z.string().url(),
})
export type Env = z.infer<typeof Env>
Env.parse(env)
