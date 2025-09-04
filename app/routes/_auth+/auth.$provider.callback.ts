import type { LoaderFunctionArgs } from 'react-router'
import { safeRedirect } from 'remix-utils/safe-redirect'
import {
	authenticator,
	getSessionExpirationDate,
	getUser,
	sessionKey,
	signupWithConnection,
} from '#app/utils/auth.server'
import { ProviderNameSchema, providerLabels } from '#app/utils/connections'
import { db } from '#app/utils/db.server'
import { combineHeaders } from '#app/utils/misc'
import {
	destroyRedirectToHeader,
	getRedirectCookieValue,
} from '#app/utils/redirect-cookie.server'
import { authSessionStorage } from '#app/utils/session.server.js'
import { createToastHeaders, redirectWithToast } from '#app/utils/toast.server'
import { verifySessionStorage } from '#app/utils/verification.server'
import { connection, session } from '../../../db/schema/authentication'
import { handleNewSession } from './login.server'
import { onboardingEmailSessionKey } from './onboarding'
import { prefilledProfileKey, providerIdKey } from './onboarding_.$provider'

const destroyRedirectTo = { 'set-cookie': destroyRedirectToHeader }

export async function loader({ params, request }: LoaderFunctionArgs) {
	const providerName = ProviderNameSchema.parse(params.provider)
	const redirectTo = getRedirectCookieValue(request)
	const label = providerLabels[providerName]

	const authResult = await authenticator
		.authenticate(providerName, request)
		.then(
			(data) =>
				({
					data,
					success: true,
				}) as const,
			(error) =>
				({
					error,
					success: false,
				}) as const,
		)

	if (!authResult.success) {
		console.error(authResult.error)
		throw await redirectWithToast(
			'/login',
			{
				description: `There was an error authenticating with ${label}.`,
				title: 'Auth Failed',
				type: 'error',
			},
			{ headers: destroyRedirectTo },
		)
	}

	const { data: profile } = authResult

	const existingConnection = await db.query.connection.findFirst({
		where: {
			providerId: profile.id,
			providerName,
		},
	})

	const userFromRequest = await getUser(request)

	if (existingConnection && userFromRequest) {
		if (existingConnection.userId === userFromRequest.id) {
			return redirectWithToast(
				'/settings/connections',
				{
					description: `Your "${profile.username}" ${label} account is already connected.`,
					title: 'Already Connected',
				},
				{ headers: destroyRedirectTo },
			)
		}
		return redirectWithToast(
			'/settings/connections',
			{
				description: `The "${profile.username}" ${label} account is already connected to another account.`,
				title: 'Already Connected',
			},
			{ headers: destroyRedirectTo },
		)
	}

	// If we're already logged in, then link the account
	if (userFromRequest) {
		await db.insert(connection).values({
			providerId: profile.id,
			providerName,
			tenantId: userFromRequest.tenantId,
			userId: userFromRequest.id,
		})
		return redirectWithToast(
			'/settings/connections',
			{
				description: `Your "${profile.username}" ${label} account has been connected.`,
				title: 'Connected',
				type: 'success',
			},
			{ headers: destroyRedirectTo },
		)
	}

	// Connection exists already? Make a new session
	if (existingConnection) {
		return makeSession({
			request,
			tenantId: existingConnection.tenantId,
			userId: existingConnection.userId,
		})
	}

	// if the email matches a user in the db, then link the account and
	// make a new session
	// const user = await prisma.user.findUnique({
	// 	select: { id: true },
	// 	where: { email: profile.email.toLowerCase() },
	// })
	const user = await db.query.user.findFirst({
		columns: { id: true, tenantId: true },
		where: { email: profile.email.toLowerCase() },
	})
	if (user) {
		await db.insert(connection).values({
			providerId: profile.id,
			providerName,
			tenantId: user.tenantId,
			userId: user.id,
		})
		return makeSession(
			{ request, tenantId: user.tenantId, userId: user.id },
			{
				headers: await createToastHeaders({
					description: `Your "${profile.username}" ${label} account has been connected.`,
					title: 'Connected',
				}),
			},
		)
	}

	// this is a new user, so let's get them onboarded
	const verifySession = await verifySessionStorage.getSession()
	verifySession.set(onboardingEmailSessionKey, profile.email)
	verifySession.set(prefilledProfileKey, {
		...profile,
		email: profile.email.toLowerCase(),
		username: profile.username?.replace(/\W/g, '_').toLowerCase(),
	})
	verifySession.set(providerIdKey, profile.id)
	const _onboardingRedirect = [
		`/dashboard/${providerName}`,
		redirectTo ? new URLSearchParams({ redirectTo }) : null,
	]
		.filter(Boolean)
		.join('?')

	const session = await signupWithConnection({
		email: profile.email.toLowerCase(),
		name: profile.name ?? '',
		username: profile.email.toLowerCase(),
	})
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)
	const headers = new Headers()
	headers.append(
		'set-cookie',
		await authSessionStorage.commitSession(authSession, {
			expires: session.expirationDate,
		}),
	)
	headers.append(
		'set-cookie',
		await verifySessionStorage.destroySession(verifySession),
	)
	return redirectWithToast(
		safeRedirect('/dashboard'),
		{ description: 'Thanks for signing up!', title: 'Welcome' },
		{ headers },
	)

	// return redirect(onboardingRedirect, {
	// 	headers: combineHeaders(
	// 		{ 'set-cookie': await verifySessionStorage.commitSession(verifySession) },
	// 		destroyRedirectTo,
	// 	),
	// })
}

async function makeSession(
	{
		redirectTo,
		request,
		tenantId,
		userId,
	}: {
		redirectTo?: null | string
		request: Request
		tenantId: string
		userId: string
	},
	responseInit?: ResponseInit,
) {
	redirectTo ??= '/dashboard'

	const [sessionResult] = await db
		.insert(session)
		.values({
			expirationDate: getSessionExpirationDate(),
			tenantId,
			userId,
		})
		.returning({
			expirationDate: session.expirationDate,
			id: session.id,
			userId: session.userId,
		})
	// const session = await prisma.session.create({
	// 	select: { id: true, expirationDate: true, userId: true },
	// 	data: {
	// 		expirationDate: getSessionExpirationDate(),
	// 		userId,
	// 	},
	// })
	return handleNewSession(
		{ redirectTo, remember: true, request, session: sessionResult },
		{ headers: combineHeaders(responseInit?.headers, destroyRedirectTo) },
	)
}
