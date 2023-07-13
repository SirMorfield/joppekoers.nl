import type { PageServerLoad } from './$types'
import { getImages as getProjects } from '$root/server/cms'

export const load: PageServerLoad = async () => {
	return {
		projects: await getProjects(),
	}
}
