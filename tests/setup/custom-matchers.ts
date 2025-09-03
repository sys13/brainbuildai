import { sessionKey } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { authSessionStorage } from '#app/utils/session.server'
import {
	type OptionalToast,
	toastKey,
	toastSessionStorage,
} from '#app/utils/toast.server'
import { convertSetCookieToCookie } from '#tests/utils'
import '@testing-library/jest-dom/vitest'
import * as setCookieParser from 'set-cookie-parser'
import { expect } from 'vitest'

expect.extend({
	toHaveRedirect(response: Response, redirectTo?: string) {
		const location = response.headers.get('location')
		const redirectToSupplied = redirectTo !== undefined
		if (redirectToSupplied !== Boolean(location)) {
			return {
				message: () =>
					`Expected response to ${this.isNot ? 'not ' : ''}redirect${
						redirectToSupplied
							? ` to ${this.utils.printExpected(redirectTo)}`
							: ''
					} but got ${
						location ? 'no redirect' : this.utils.printReceived(location)
					}`,
				pass: Boolean(location),
			}
		}

		const isRedirectStatusCode = response.status >= 300 && response.status < 400
		if (!isRedirectStatusCode) {
			return {
				message: () =>
					`Expected redirect to ${
						this.isNot ? 'not ' : ''
					}be ${this.utils.printExpected(
						'>= 300 && < 400',
					)} but got ${this.utils.printReceived(response.status)}`,
				pass: false,
			}
		}

		function toUrl(s?: null | string) {
			const url = s ?? ''
			return url.startsWith('http')
				? new URL(url)
				: new URL(url, 'https://example.com')
		}

		function urlsMatch(u1: URL, u2: URL) {
			const u1SP = new URL(u1).searchParams
			u1SP.sort()
			const u2SP = new URL(u2).searchParams
			u2SP.sort()
			return (
				u1.origin === u2.origin &&
				u1.pathname === u2.pathname &&
				u1SP.toString() === u2SP.toString() &&
				u1.hash === u2.hash
			)
		}

		return {
			message: () =>
				`Expected response to ${
					this.isNot ? 'not ' : ''
				}redirect to ${this.utils.printExpected(
					redirectTo,
				)} but got ${this.utils.printReceived(location)}`,
			pass:
				location === redirectTo ||
				urlsMatch(toUrl(location), toUrl(redirectTo)),
		}
	},
	async toHaveSessionForUser(response: Response, userId: string) {
		const setCookies = response.headers.getSetCookie()
		const sessionSetCookie = setCookies.find(
			(c) => setCookieParser.parseString(c).name === 'en_session',
		)

		if (!sessionSetCookie) {
			return {
				message: () =>
					`The en_session set-cookie header was${
						this.isNot ? '' : ' not'
					} defined`,
				pass: false,
			}
		}

		const authSession = await authSessionStorage.getSession(
			convertSetCookieToCookie(sessionSetCookie),
		)
		const sessionValue = authSession.get(sessionKey)

		if (!sessionValue) {
			return {
				message: () => `A session was${this.isNot ? '' : ' not'} set in cookie`,
				pass: false,
			}
		}

		const session = await db.query.session.findFirst({
			columns: { id: true },
			where: { userId, id: sessionValue },
		})

		return {
			message: () =>
				`A session was${
					this.isNot ? ' not' : ''
				} created in the database for ${userId}`,
			pass: Boolean(session),
		}
	},
	async toSendToast(response: Response, toast: OptionalToast) {
		const setCookies = response.headers.getSetCookie()
		const toastSetCookie = setCookies.find(
			(c) => setCookieParser.parseString(c).name === 'en_toast',
		)

		if (!toastSetCookie) {
			return {
				message: () =>
					`en_toast set-cookie header was${this.isNot ? '' : ' not'} defined`,
				pass: false,
			}
		}

		const toastSession = await toastSessionStorage.getSession(
			convertSetCookieToCookie(toastSetCookie),
		)
		const toastValue = toastSession.get(toastKey)

		if (!toastValue) {
			return {
				message: () => `toast was${this.isNot ? '' : ' not'} set in session`,
				pass: false,
			}
		}

		const pass = this.equals(toastValue, toast)

		const diff = pass ? null : `\n${this.utils.diff(toastValue, toast)}`

		return {
			message: () =>
				`toast in the response ${
					this.isNot ? 'does not match' : 'matches'
				} the expected toast${diff}`,
			pass,
		}
	},
})

// interface CustomMatchers<R = unknown> {
// 	toHaveRedirect(redirectTo: null | string): R
// 	toHaveSessionForUser(userId: string): Promise<R>
// 	toSendToast(toast: OptionalToast): Promise<R>
// }
