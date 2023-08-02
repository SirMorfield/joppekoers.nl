// prettier-ignore
const example = [ { name: 'I am a string', images: [ { url: 'http://127.0.0.1:8080/projects/big-hammer/favicon.png', width: 64, height: 64, }, ], }, ]

import { env } from '$root/env'

export type Image = {
	format: 'heic' | 'heif' | 'avif' | 'webp' | 'jpeg' | 'jpg' | 'png' | 'gif' | 'tiff'
	height: number
	width: number
	src: string
}
export type ImageSource = {
	alt: string
	srcset: string
	formats: Image[]
}
export type Project = {
	id: number
	header: ImageSource
	content: ImageSource[]
}

// TODO: this is incorrect for multiple image formats, but since webp is first in the list, it will work on any browser
function imageSetToSrcSet(images: Image[]): string {
	return images.map(({ src, width }) => `${src} ${width}w`).join(', ')
}

function generateFormatQueries(url: string, w: number, h: number): Image[] {
	// avif is not yet supported by sharp
	const types: Image['format'][] = ['webp', 'heif' /*'avif'*/]
	const sizes = [w, 1920, 1024, 480].filter(size => size <= w)
	const images: Image[] = []
	for (const type of types) {
		for (const size of sizes) {
			const height = Math.round((size / w) * h)
			const image: Image = {
				format: type,
				height,
				width: size,
				src: `${url}?format=${type}&resize=${size}x${height}`,
			}
			images.push(image)
		}
	}
	return images
}

async function fetch2<T>(input: URL | RequestInfo, init?: RequestInit): Promise<Error | T> {
	let resp
	try {
		resp = await fetch(input, init)
	} catch (e) {
		return new Error(e)
	}
	if (!resp.ok) {
		return new Error(`Failed to fetch ${resp.url}: ${resp.statusText}`)
	}

	try {
		return resp.json()
	} catch (e) {
		return new Error('Failed to JSON parse response')
	}
}

export async function getProjects(): Promise<Project[]> {
	const data = await fetch2<typeof example>(new URL(`/projects-list`, env.cmsUrl))
	if (data instanceof Error) {
		console.error(data)
		return []
	}
	return data.map((data, i) => {
		const header = data.images.at(0)
		const headerQueries = generateFormatQueries(
			new URL(header.url, env.cmsUrl).toString(),
			header.width,
			header.height,
		)
		const contentQueries = data.images.map(img => {
			const url = new URL(img.url, env.cmsUrl).toString()
			return generateFormatQueries(url, img.width, img.height)
		})

		return {
			id: i,
			header: {
				alt: header.url,
				srcset: imageSetToSrcSet(headerQueries),
				formats: headerQueries,
			},
			content: contentQueries.map((queries, i) => ({
				alt: data.images[i].url,
				srcset: imageSetToSrcSet(queries),
				formats: queries,
			})),
		}
	})
}
