// prettier-ignore
const example = { data: [ { id: 3, attributes: { createdAt: '2023-07-12T20:33:01.408Z', updatedAt: '2023-07-13T08:41:31.229Z', publishedAt: '2023-07-12T20:33:02.332Z', all: { data: [ { id: 58, attributes: { name: '32-2022-07-08.jpg', alternativeText: null, caption: null, width: 4032, height: 3024, formats: { thumbnail: { name: 'thumbnail_32-2022-07-08.jpg', hash: 'thumbnail_32_2022_07_08_4110c221df', ext: '.jpg', mime: 'image/jpeg', path: null, width: 208, height: 156, size: 9.42, url: '/uploads/thumbnail_32_2022_07_08_4110c221df.jpg', }, }, hash: '32_2022_07_08_4110c221df', ext: '.jpg', mime: 'image/jpeg', size: 4407.54, url: '/uploads/32_2022_07_08_4110c221df.jpg', previewUrl: null, provider: 'local', provider_metadata: null, createdAt: '2023-07-12T20:32:55.913Z', updatedAt: '2023-07-12T20:32:55.913Z', }, }, ], }, header: { data: { id: 42, attributes: { name: '01-2022-07-22.jpg', alternativeText: null, caption: null, width: 4032, height: 3024, formats: { thumbnail: { name: 'thumbnail_01-2022-07-22.jpg', hash: 'thumbnail_01_2022_07_22_21af64295b', ext: '.jpg', mime: 'image/jpeg', path: null, width: 208, height: 156, size: 6.03, url: '/uploads/thumbnail_01_2022_07_22_21af64295b.jpg', }, }, hash: '01_2022_07_22_21af64295b', ext: '.jpg', mime: 'image/jpeg', size: 3763.22, url: '/uploads/01_2022_07_22_21af64295b.jpg', previewUrl: null, provider: 'local', provider_metadata: null, createdAt: '2023-07-12T20:32:09.669Z', updatedAt: '2023-07-12T20:32:09.669Z', }, }, }, }, }, ], meta: { pagination: { page: 1, pageSize: 9999999, pageCount: 1, total: 1, }, }, }

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

export async function getImages(): Promise<Project[]> {
	const data = await fetch2<typeof example>(new URL(`/api/photos?populate=*`, env.cmsUrl))
	if (data instanceof Error) {
		console.error(data)
		return []
	}
	return data.data.map(data => {
		const header = data.attributes.header.data.attributes
		const content = data.attributes.all.data
		const headerQueries = generateFormatQueries(
			new URL(header.url, env.cmsUrl).toString(),
			header.width,
			header.height,
		)
		const contentQueries = content.map(({ attributes: img }) => {
			const url = new URL(img.url, env.cmsUrl).toString()
			return generateFormatQueries(url, img.width, img.height)
		})

		return {
			id: data.id,
			header: {
				alt: header.alternativeText ?? '',
				srcset: imageSetToSrcSet(headerQueries),
				formats: headerQueries,
			},
			content: contentQueries.map((queries, i) => ({
				alt: content[i].attributes.alternativeText ?? '',
				srcset: imageSetToSrcSet(queries),
				formats: queries,
			})),
		}
	})
}
