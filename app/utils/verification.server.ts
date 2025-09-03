import { createCookieSessionStorage } from 'react-router'

export const verifySessionStorage = createCookieSessionStorage({
	cookie: {
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		name: 'en_verification',
		path: '/',
		sameSite: 'lax',
		secrets: process.env.SESSION_SECRET?.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})
