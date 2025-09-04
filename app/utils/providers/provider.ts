import type { Strategy } from 'remix-auth/strategy'
import type { Timings } from '../timing.server'

// Define a user type for cleaner typing
export interface ProviderUser {
	email: string
	id: string
	imageUrl?: string
	name?: string
	username?: string
}

export interface AuthProvider {
	// biome-ignore lint/suspicious/noExplicitAny: misc
	getAuthStrategy(): null | Strategy<ProviderUser, any>
	handleMockAction(request: Request): Promise<void>
	resolveConnectionData(
		providerId: string,
		options?: { timings?: Timings },
	): Promise<{
		displayName: string
		link?: null | string
	}>
}

export const normalizeEmail = (s: string) => s.toLowerCase()

export const normalizeUsername = (s: string) =>
	s.replace(/\W/g, '_').toLowerCase()
