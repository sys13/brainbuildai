import { z } from 'zod'

export function typedKeys<T extends object>(o: T): (keyof T)[] {
	return Object.keys(o) as (keyof T)[]
}

export function compact<T>(arr: T[]): NonNullable<T>[] {
	return arr.filter(Boolean) as NonNullable<T>[]
}

export function extractEmailDomain(email: string): string {
	// Split the email at the '@' character.
	const parts = email.split('@')

	// Check if the email contains an '@' character and return the domain part.
	if (parts.length > 1) {
		return parts[1]
	}
	// If the email does not contain an '@' character, return an empty string or an error message.
	return 'Invalid email address'
}

export const booleanFromStringSchema = z.preprocess((val) => {
	if (typeof val === 'string') {
		return val.toLowerCase() === 'true'
	}
	return val
}, z.boolean())
