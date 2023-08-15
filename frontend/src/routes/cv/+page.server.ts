import { env } from '$root/env'
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = () => {
	throw redirect(302, new URL('/media/CV Joppe Koers.pdf', env.cmsUrl).toString())
}
