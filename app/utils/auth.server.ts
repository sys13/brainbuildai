import { createTenant } from '#app/models/tenant.server'
import { user } from '#db/schema/base'
import { GoogleStrategy } from '@coji/remix-auth-google'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { redirect } from 'react-router'
import { Authenticator } from 'remix-auth'
import { GitHubStrategy } from 'remix-auth-github'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'
import {
	password as passwordSchema,
	session,
} from '../../db/schema/authentication'
import { userToRole } from '../../db/schema/role'
import { db } from './db.server'
import { pick } from './lodash'
import { combineHeaders } from './misc'
import type { ProviderUser } from './providers/provider'
import { authSessionStorage } from './session.server'
import type { Tier } from './types'
import type { TenantUser } from './user'

// type Connection = {
// 	id: string
// 	providerName: string
// 	providerId: string
// 	createdAt: Date
// 	updatedAt: Date
// 	userId: string
// }

interface User {
	createdAt: Date
	email: string
	id: string
	name: null | string
	updatedAt: Date
	username: string
}

interface GithubUserProps {
	login: string
	id: string
	avatar_url: string
}

const GitHubEmailSchema = z.object({
	email: z.string(),
	verified: z.boolean(),
	primary: z.boolean(),
	visibility: z.string().nullable(),
})

const GitHubEmailsResponseSchema = z.array(GitHubEmailSchema)

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export const authenticator = new Authenticator<ProviderUser>()

authenticator.use(
	new GitHubStrategy(
		{
			clientId: process.env.GITHUB_CLIENT_ID || '',
			clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
			redirectURI: `${process.env.REDIRECT_BASE_URL}/auth/github/callback`,
			scopes: ['read:user', 'user:email'], // optional
		},
		async ({ tokens }) => {
			const response = await fetch('https://api.github.com/user', {
				headers: {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${tokens.accessToken()}`,
					'X-GitHub-Api-Version': '2022-11-28',
				},
			})
			const githubUser = (await response.json()) as GithubUserProps

			const res = await fetch('https://api.github.com/user/emails', {
				headers: {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${tokens.accessToken()}`,
					'X-GitHub-Api-Version': '2022-11-28',
				},
			})

			const rawEmails = await res.json()
			const emails = GitHubEmailsResponseSchema.parse(rawEmails)
			const email = emails.find((e) => e.primary)?.email
			if (!email) {
				throw new Error('Email not found')
			}

			return {
				email,
				id: githubUser?.id,
				imageUrl: githubUser?.avatar_url,
				name: githubUser?.login,
				username: githubUser?.login,
			}
		},
	),
)

authenticator.use(
	new GoogleStrategy(
		{
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
			redirectURI: `${process.env.REDIRECT_BASE_URL}/auth/google/callback`,
		},
		async ({ tokens }) => {
			const profile = await GoogleStrategy.userProfile(tokens)

			return {
				email: profile.emails[0].value,
				id: profile.id,
				imageUrl: profile.photos[0].value,
				name: profile.displayName,
				username: profile.emails[0].value,
			}
		},
	),
)

const JWT_SCHEMA = z.object({
	id: z.string(),
})

export async function getUser(request: Request) {
	const hostname = new URL(request.url).hostname

	const tenantId = (
		await db.query.tenant.findFirst({
			where: { hostname },
		})
	)?.id

	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)

	if (!sessionId) {
		const url = new URL(request.url)
		const jwtParams = url.searchParams.get('token')
		if (jwtParams === null || tenantId === undefined) {
			return null
		}

		const jwtResults = jwt.verify(jwtParams, process.env.JWT_SECRET as string)

		const { id } = JWT_SCHEMA.parse(jwtResults)

		const userResult = db.query.user.findFirst({
			columns: { id: true, internal: true, tenantId: true },
			where: { tenantId, id },
		})

		return userResult
	}

	const sessionResult = await db.query.session.findFirst({
		where: {
			id: sessionId,
			expirationDate: {
				gt: new Date(),
			},
		},
		with: { user: { columns: { id: true, internal: true, tenantId: true } } },
	})

	if (!sessionResult?.user) {
		throw redirect('/', {
			headers: {
				'set-cookie': await authSessionStorage.destroySession(authSession),
			},
		})
	}

	return sessionResult.user
}

function getLoginRedirect(
	request: Request,
	{ redirectTo }: { redirectTo?: null | string } = {},
): string {
	const requestUrl = new URL(request.url)
	redirectTo =
		redirectTo === null
			? null
			: (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`)
	const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
	const loginRedirect = ['/login', loginParams?.toString()]
		.filter(Boolean)
		.join('?')
	console.log('[getLoginRedirect] redirecting to:', loginRedirect)
	return loginRedirect
}

export async function requireUser(
	request: Request,
	{ redirectTo }: { redirectTo?: null | string } = {},
): Promise<TenantUser> {
	const user = await getUser(request)
	if (!user) {
		throw redirect(getLoginRedirect(request, { redirectTo }))
	}

	return user
}

export async function requireInternalUser(
	request: Request,
	{ redirectTo }: { redirectTo?: null | string } = {},
): Promise<TenantUser> {
	const user = await getUser(request)
	if (!user || !user.internal) {
		throw redirect(getLoginRedirect(request, { redirectTo }))
	}

	return user
}

export async function requireAdminUser(
	request: Request,
	{ redirectTo }: { redirectTo?: null | string } = {},
): Promise<TenantUser> {
	const user = await requireUser(request, { redirectTo })

	const adminRole = await db.query.role.findFirst({
		where: { tenantId: user.tenantId, name: 'admin' },
	})

	if (!adminRole) {
		throw new Error('admin role not found')
	}

	const isAdmin = await db.query.userToRole.findFirst({
		where: {
			tenantId: user.tenantId,
			userId: user.id,
			roleId: adminRole.id,
		},
	})
	if (!isAdmin) {
		throw redirect(getLoginRedirect(request, { redirectTo }))
	}

	return user
}

export async function requireSuperAdminUser(
	request: Request,
	{ redirectTo }: { redirectTo?: null | string } = {},
): Promise<TenantUser> {
	const user = await requireUser(request, { redirectTo })

	const superAdminRole = await db.query.role.findFirst({
		where: { name: 'superadmin' },
	})

	if (!superAdminRole) {
		throw new Error('super admin role not found')
	}

	const isAdmin = await db.query.userToRole.findFirst({
		where: {
			userId: user.id,
			roleId: superAdminRole.id,
		},
	})
	if (!isAdmin) {
		throw redirect(getLoginRedirect(request, { redirectTo }))
	}

	return user
}

export async function requireAnonymous(request: Request) {
	const user = await getUser(request)
	if (user) {
		console.log(
			'[requireAnonymous] redirecting authenticated user from /login to /',
		)
		throw redirect('/')
	} else {
		console.log('[requireAnonymous] no user, allowing access to /login')
	}
}

export async function login({
	password,
	username,
}: {
	password: string
	username: User['username']
}) {
	const user = await verifyUserPassword({ username }, password)

	if (!user) {
		return null
	}
	const sessionResult = (
		await db
			.insert(session)
			.values({
				expirationDate: getSessionExpirationDate(),
				tenantId: user.tenantId,
				userId: user.id,
			})
			.returning({
				expirationDate: session.expirationDate,
				id: session.id,
				userId: session.userId,
			})
	)[0]

	return sessionResult
}

export async function resetUserPassword({
	password,
	username,
}: {
	password: string
	username: User['username']
}) {
	const hashedPassword = await getPasswordHash(password)
	const userId = (
		await db.query.user.findFirst({
			columns: { id: true },
			where: { username },
		})
	)?.id

	if (!userId) {
		return null
	}
	return db
		.update(passwordSchema)
		.set({ hash: hashedPassword })
		.where(eq(passwordSchema.userId, userId))
}

export async function signup({
	email,
	marketingEmails,
	name,
	password,
	stripeCustomerId,
	tier,
	username,
	whatToBuild,
}: {
	email: User['email']
	marketingEmails?: boolean
	name: User['name']
	password: string
	stripeCustomerId?: string
	tier?: Tier
	username: User['username']
	whatToBuild?: string
}) {
	const hashedPassword = await getPasswordHash(password)

	const tenantId = await createTenant({
		completedOnboarding: false,
		stripeCustomerId,
		tier,
		whatToBuild,
	})

	const userId = await db.transaction(async (tx) => {
		const userId = (
			await tx
				.insert(user)
				.values({
					email: email.toLowerCase(),
					internal: true,
					marketingEmails,
					name,
					tenantId,
					username: username.toLowerCase(),
				})
				.returning({ id: user.id })
		)[0].id

		await tx.insert(passwordSchema).values({
			hash: hashedPassword,
			tenantId,
			userId,
		})

		const roleIds = await tx.query.role
			.findMany({
				columns: { id: true },
				where: {
					tenantId,
					name: { in: ['user', 'admin'] },
				},
			})
			.then((roles) => roles.map((role) => role.id))

		if (roleIds.length !== 2) {
			throw new Error('roles not found')
		}
		await tx
			.insert(userToRole)
			.values(roleIds.map((roleId) => ({ roleId, tenantId, userId })))

		return userId
	})

	const sessionResult = (
		await db
			.insert(session)
			.values({
				expirationDate: getSessionExpirationDate(),
				tenantId,
				userId,
			})
			.returning({
				expirationDate: session.expirationDate,
				id: session.id,
			})
	)[0]

	return sessionResult
}

export async function signupWithConnection({
	email,
	name,
	username,
	// providerId,
	// providerName,
	// imageUrl,
}: {
	email: User['email']
	name: User['name']
	username: User['username']
	// providerId: Connection['providerId']
	// providerName: Connection['providerName']
	// imageUrl?: string
}) {
	const tenantId = await createTenant()

	const sessionResult = await db.transaction(async (tx) => {
		const userId = (
			await tx
				.insert(user)
				.values({
					email: email.toLowerCase(),
					name,
					tenantId,
					username: username.toLowerCase(),
					internal: true,
				})
				.returning({ id: user.id })
		)[0].id

		const roleId = (
			await tx.query.role.findFirst({
				columns: { id: true },
				where: { name: 'user' },
			})
		)?.id

		if (!roleId) {
			throw new Error('user role not found')
		}
		await tx.insert(userToRole).values({ roleId, tenantId, userId })
		return (
			await tx
				.insert(session)
				.values({
					expirationDate: getSessionExpirationDate(),
					tenantId,
					userId,
				})
				.returning({
					expirationDate: session.expirationDate,
					id: session.id,
				})
		)[0]
	})

	return sessionResult
}

export async function logout(
	{
		redirectTo = '/',
		request,
	}: {
		redirectTo?: string
		request: Request
	},
	responseInit?: ResponseInit,
) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	// if this fails, we still need to delete the session from the user's browser
	// and it doesn't do any harm staying in the db anyway.
	if (sessionId) {
		void db.delete(session).where(eq(session.id, sessionId))
	}

	throw redirect(safeRedirect(redirectTo), {
		...responseInit,
		headers: combineHeaders(
			{ 'set-cookie': await authSessionStorage.destroySession(authSession) },
			responseInit?.headers,
		),
	})
}

export async function getPasswordHash(password: string) {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export async function verifyUserPassword(
	where: Pick<User, 'id'> | Pick<User, 'username'>,
	password: string,
): Promise<null | TenantUser> {
	const newWhere =
		'id' in where
			? ({ id: where.id } as const)
			: ({ username: where.username } as const)

	const userWithPassword = await db.query.user.findFirst({
		where: newWhere,
		with: { password: { columns: { hash: true } } },
	})

	if (!userWithPassword || !userWithPassword.password) {
		return null
	}

	const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

	if (!isValid) {
		return null
	}

	return pick(userWithPassword, ['id', 'tenantId'])
}
