import * as cookie from 'cookie'

const cookieName = 'en_theme'
export type Theme = 'dark' | 'light'

export function getTheme(request: Request): null | Theme {
	const cookieHeader = request.headers.get('cookie')
	const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : 'light'

	if (parsed === 'light' || parsed === 'dark') {
		return parsed
	}
	return null
}

export function setTheme(theme: 'system' | Theme) {
	if (theme === 'system') {
		return cookie.serialize(cookieName, '', { maxAge: -1, path: '/' })
	}
	return cookie.serialize(cookieName, theme, { path: '/' })
}
