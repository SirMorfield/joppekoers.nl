import type { HandleServerError } from '@sveltejs/kit'

function toString(e: unknown) {
	if (e instanceof Error) {
		return e.message
	}
	return String(e)
}
export const handleError: HandleServerError = a => {
	if (a.event.route.id) {
		console.error(a.error)
		return {
			status: 500,
			message: toString(a.error),
		}
	}
	const message = `404: page ${a.event.url.pathname} not found`
	console.log(message)
	return { message }
}
