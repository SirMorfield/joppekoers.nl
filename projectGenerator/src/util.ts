// export type Brand<K, T> = K & { __brand: T }
export type Path = string
export type FileName = string
import { ImageExport, ProjectExport } from '@shared/types'
import * as path from 'path'
import fs from 'fs-extra'
import prettyBytes from 'pretty-bytes'
import { exec as e } from 'child_process'
import { promisify } from 'util'
export const exec = promisify(e)

export interface Image {
	name: FileName // eg. 01.jpg
	path: Path // eg. /path/to/01.jpg
	width: number
	height: number
	size: number
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
		width: image.width,
		height: image.height,
		alt: image.name,
	}
}

export function projectToProjectExport(project: Project): ProjectExport {
	return {
		id: project.id,
		thumbnail: imageToImg(project.thumbnail),
		imgs: project.images.map(imageToImg),
		root: `${path.join('/img/projectImg/', project.id)}/`,
	}
}

export interface ImageInfo {
	width: number
	height: number
	size: number
	path: string
	incorrectEXIF: boolean
}

export async function imageInfo(path: string): Promise<ImageInfo> {
	const identity = await exec(`identify -format "%wx%h" '${path}'`)
	if (identity.stderr) {
		console.error(identity.stderr)
	}
	identity.stdout = identity.stdout.trim()
	const [width, height] = identity.stdout.split('x')
	const { size } = await fs.stat(path)

	const result = {
		width: Number(width),
		height: Number(height),
		size,
		path,
		incorrectEXIF: false,
	}
	if (Number.isNaN(result.width) || Number.isNaN(result.height)) {
		throw new Error(`Could not get image info for ${path}`)
	}
	// account for some android phones in which
	// the data is stored in portrait mode, but the photo was taken in vertical
	// const { stdout } = await exec(`exiftool -t Orientation -m '${path}'`)
	// if (stdout.match(/Right\-top/m) || stdout.match(/Left\-bottom/m)) {
	// 	;[result.width, result.height] = [result.height, result.width]
	// 	result.incorrectEXIF = true
	// }
	return result
}

export function imageInfoString(info: ImageInfo): string {
	const wh = `${info.width}x${info.height}`.padEnd(9)
	const p = path.relative(process.cwd(), info.path)
	return `${wh} ${prettyBytes(info.size, { minimumFractionDigits: 2 }).padStart(11)} ${p}`
}
