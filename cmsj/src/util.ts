import fs from 'fs'

function unknownToError(err: unknown): Error {
	if (err instanceof Error) {
		return err
	}
	if (typeof err === 'string') {
		return new Error(err)
	}
	return new Error(JSON.stringify(err))
}

type SyncFn = (...args: unknown[]) => unknown
type AsyncFn = (...args: unknown[]) => Promise<unknown>
export function exceptionAsValue<Fn extends AsyncFn>(fn: Fn): Promise<Awaited<ReturnType<Fn>> | Error>
export function exceptionAsValue<Fn extends SyncFn>(fn: Fn): ReturnType<Fn> | Error
export function exceptionAsValue<Fn extends SyncFn | SyncFn>(fn: Fn) {
	try {
		const res = fn()
		if (!(res instanceof Promise)) {
			return res
		}
		return new Promise(resolve => {
			res.then(resolve).catch(e => resolve(unknownToError(e)))
		})
	} catch (err) {
		return unknownToError(err)
	}
}

export async function fsExists(path: string): Promise<boolean> {
	return !!(await fs.promises.stat(path).catch(() => false))
}

export function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

export function safeParseJSON<T>(data: string): T | Error {
	try {
		return JSON.parse(data)
	} catch (error) {
		return error as Error
	}
}

export async function filterAsync<T>(
	array: T[],
	predicate: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> {
	const fail = Symbol()
	return (
		await Promise.all(
			array.map(async (item, i) => {
				return (await predicate(item, i, array)) ? item : fail
			}),
		)
	).filter(i => i !== fail) as T[]
}
