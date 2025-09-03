import { createCookieSessionStorage } from 'react-router'
// import { GitHubProvider } from './providers/github.server'

export const connectionSessionStorage = createCookieSessionStorage({
	cookie: {
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		name: 'en_connection',
		path: '/',
		sameSite: 'lax',
		secrets: process.env.SESSION_SECRET?.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})

// export const providers: Record<ProviderName, AuthProvider> = {
// 	github: new GitHubProvider(),
// }

// export function handleMockAction(providerName: ProviderName, request: Request) {
// 	return providers[providerName].handleMockAction(request)
// }

// export function resolveConnectionData(
// 	providerName: ProviderName,
// 	providerId: string,
// 	options?: { timings?: Timings },
// ) {
// 	return providers[providerName].resolveConnectionData(providerId, options)
// }
