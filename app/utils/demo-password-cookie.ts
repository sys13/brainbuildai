import { createCookie } from 'react-router'

export const passwordCookie = createCookie('access_token', {
	httpOnly: true,
	path: '/',
	sameSite: 'lax',
	secure: process.env.NODE_ENV === 'production',
})
