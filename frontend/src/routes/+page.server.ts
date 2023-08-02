import { getProjects } from '$root/server/cms'

export const load = async () => {
	console.time('Got projects in')
	const projects = await getProjects()
	console.timeEnd('Got projects in') // TODO: remove
	return {
		projects,
	}
}
