import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = a => {
	const message = `404: page ${a.event.url.pathname} not found`
	console.log(message)
	return { message }
}
