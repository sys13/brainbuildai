import { invariant } from '@epic-web/invariant'
import { redirect } from 'react-router'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { getUser, sessionKey } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { combineResponseInits } from '#app/utils/misc'
import { authSessionStorage } from '#app/utils/session.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { verifySessionStorage } from '#app/utils/verification.server'
import { twoFAVerificationType } from '../_internal+/settings+/two-factor'
import { type VerifyFunctionArgs, getRedirectToUrl } from './verify.server'

const verifiedTimeKey = 'verified-time'
const unverifiedSessionIdKey = 'unverified-session-id'
const rememberKey = 'remember'

export async function handleNewSession(
	{
		redirectTo,
		remember,
		request,
		session,
	}: {
		redirectTo?: string
		remember: boolean
		request: Request
		session: { expirationDate: Date; id: string; userId: string }
	},
	responseInit?: ResponseInit,
) {
	const verification = await db.query.verification.findFirst({
		columns: { id: true },
		where: {
			target: session.userId,
			type: twoFAVerificationType,
		},
	})
	const userHasTwoFactor = Boolean(verification)

	if (userHasTwoFactor) {
		const verifySession = await verifySessionStorage.getSession()
		verifySession.set(unverifiedSessionIdKey, session.id)
		verifySession.set(rememberKey, remember)
		const redirectUrl = getRedirectToUrl({
			redirectTo,
			request,
			target: session.userId,
			type: twoFAVerificationType,
		})
		return redirect(
			`${redirectUrl.pathname}?${redirectUrl.searchParams}`,
			combineResponseInits(
				{
					headers: {
						'set-cookie':
							await verifySessionStorage.commitSession(verifySession),
					},
				},
				responseInit,
			),
		)
	}
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)

	return redirect(
		safeRedirect(redirectTo),
		combineResponseInits(
			{
				headers: {
					'set-cookie': await authSessionStorage.commitSession(authSession, {
						expires: remember ? session.expirationDate : undefined,
					}),
				},
			},
			responseInit,
		),
	)
}

export async function handleVerification({
	request,
	submission,
}: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)

	const remember = verifySession.get(rememberKey)
	const { redirectTo } = submission.value
	const headers = new Headers()
	authSession.set(verifiedTimeKey, Date.now())

	const unverifiedSessionId = verifySession.get(unverifiedSessionIdKey)
	if (unverifiedSessionId) {
		const sessionResult = await db.query.session.findFirst({
			columns: { expirationDate: true },
			where: { id: unverifiedSessionId },
		})
		if (!sessionResult) {
			throw await redirectWithToast('/login', {
				description: 'Could not find session to verify. Please try again.',
				title: 'Invalid session',
				type: 'error',
			})
		}

		authSession.set(sessionKey, unverifiedSessionId)

		headers.append(
			'set-cookie',
			await authSessionStorage.commitSession(authSession, {
				expires: remember ? sessionResult.expirationDate : undefined,
			}),
		)
	} else {
		headers.append(
			'set-cookie',
			await authSessionStorage.commitSession(authSession),
		)
	}

	headers.append(
		'set-cookie',
		await verifySessionStorage.destroySession(verifySession),
	)

	return redirect(safeRedirect(redirectTo), { headers })
}

export async function shouldRequestTwoFA(request: Request) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)

	if (verifySession.has(unverifiedSessionIdKey)) {
		return true
	}
	const { id: userId } = (await getUser(request)) ?? {}

	if (!userId) {
		return false
	}
	// if it's over two hours since they last verified, we should request 2FA again
	// if it's over two hours since they last verified, we should request 2FA again

	const userHasTwoFA = await db.query.verification.findFirst({
		columns: { id: true },
		where: { target: userId, type: twoFAVerificationType },
	})

	if (!userHasTwoFA) {
		return false
	}
	const verifiedTime = authSession.get(verifiedTimeKey) ?? new Date(0)
	const twoHours = 1000 * 60 * 2
	return Date.now() - verifiedTime > twoHours
}
