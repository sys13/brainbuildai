export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]) {
	return keys.reduce(
		(acc, key) => {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				acc[key] = obj[key]
			}

			return acc
		},
		{} as Record<K, T[K]>,
	)
}

export function omit<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): Omit<T, K> {
	const result = { ...obj }
	for (const key of keys) {
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete result[key]
	}

	return result
}

export function removeNullishValues<T>(arr: (null | T | undefined)[]): T[] {
	return arr.filter(
		(value): value is T => value !== null && value !== undefined,
	)
}
