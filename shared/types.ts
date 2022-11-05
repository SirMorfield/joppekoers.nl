export type Path = string
export type FileName = string

export interface ImageExport {
	src: Path
	width: number
	height: number
	alt: string
}

export interface ProjectExport {
	id: string
	thumbnail: ImageExport
	imgs: ImageExport[]
	root: Path
}
