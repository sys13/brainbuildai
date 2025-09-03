export function getFirstNonNull(obj: unknown, keys: string[]) {
	for (const key of keys) {
		// @ts-expect-error - we don't know the type of obj
		const value = obj[key]
		if (value !== null && value !== undefined) {
			const valueStr = String(value)
			return valueStr.slice(0, 10) + (valueStr.length > 10 ? '...' : '')
		}
	}
	return null
}
