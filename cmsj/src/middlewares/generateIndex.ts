import fs from 'fs'
import path from 'path'
import { env } from '../env'
import { Project, dirToProject } from '../project'
import { filterAsync } from '../util'

// JS does not have async function chaining :(
export async function generateIndex(): Promise<Project[]> {
	const folders = await fs.promises.readdir(env.projects)

	const projectFolders = await filterAsync(folders, async (file: string) => {
		if (file.startsWith('.')) {
			return false
		}
		const stat = await fs.promises.stat(path.join(env.projects, file))
		return stat.isDirectory()
	})
	const sorted = projectFolders.sort((a, b) => (a > b ? 1 : -1))
	const projects = await Promise.all(sorted.map(dirToProject))
	const filtered = projects.filter(project => project.images.length > 0)
	return filtered
}
