export type Path = string
export type FileName = string

export interface ImageExport {
	src: Path
	w: number
	h: number
}

export interface ProjectExport {
	thumbnail: ImageExport
	imgs: ImageExport[]
	root: Path
}
