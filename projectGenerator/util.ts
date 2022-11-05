export type Path = string
export type FileName = string
import { ImageExport, ProjectExport } from '@shared/types'
import * as path from 'path'

export interface Image {
	name: FileName // eg. 01.jpg
	path: Path // eg. /path/to/01.jpg
	width: number
	height: number
}

export interface Job {
	id: string // id / slug of the project
	imgs: Path[] // the full image paths of the job
	output: Path
}

export interface Project {
	id: string
	thumbnail: Image
	images: Image[]
}

export function imageToImg(image: Image): ImageExport {
	return {
		src: image.name,
		w: image.width,
		h: image.height,
	}
}

export function projectToProjectExport(project: Project): ProjectExport {
	return {
		thumbnail: imageToImg(project.thumbnail),
		imgs: project.images.map(imageToImg),
		root: path.join('/img/projectImg/', project.id) + '/',
	}
}

export const exec = require('util').promisify(require('child_process').exec)

export async function createThumbnail(imagePath: string, thumbnailPath: string): Promise<Image> {
	const { stderr } = await exec(`convert -resize 'X300' '${imagePath}' '${thumbnailPath}'`)
	if (stderr) console.error(stderr)
	const image = {
		...(await imageSize(thumbnailPath)),
		path: thumbnailPath,
		name: path.basename(thumbnailPath),
	}
	return image
}

export async function imageSize(path: string): Promise<{ width: number; height: number }> {
	const identity = await exec(`identify -format "%wx%h" '${path}'`)
	if (identity.stderr) console.error(identity.stderr)
	identity.stdout = identity.stdout.trim()
	identity.stdout = identity.stdout.split('x')
	const result = {
		width: parseInt(identity.stdout[0]),
		height: parseInt(identity.stdout[1]),
	}
	// account for some android phones in which
	// the data is stored in portrait mode, but the photo was taken in vertical
	try {
		const { stdout } = await exec(`exif -t Orientation -m '${path}'`)
		if (stdout.match(/Right\-top/m) || stdout.match(/Left\-bottom/m)) {
			;[result.width, result.height] = [result.height, result.width]
		}
	} catch (err) {}
	return result
}
