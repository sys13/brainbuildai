import { keysToTrues } from '#app/models/sqlUtils.server'
import { createTenant } from '#app/models/tenant.server'
import { getSessionExpirationDate, sessionKey } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { authSessionStorage } from '#app/utils/session.server'
import type { TenantUser } from '#app/utils/user'
import { password as passwordSchema, session } from '#db/schema/authentication'
import { tenant, user } from '#db/schema/base'
import { persona } from '#db/schema/persona'
import { product } from '#db/schema/product'
import { test as base } from '@playwright/test'
import { eq } from 'drizzle-orm'
import * as setCookieParser from 'set-cookie-parser'
import { userToRole } from '../db/schema/role'
import { createPassword, createUser } from './db-utils'

export * from './db-utils'

// Function to add dummy setup data to a tenant
async function addDummySetupData(tenantId: string) {
	// Check if there are already products for this tenant
	const existingProducts = await db.query.product.findMany({
		where: { tenantId },
		limit: 1,
	})

	// Only add dummy data if no products exist yet
	if (existingProducts.length === 0) {
		// Add dummy products similar to what parseWebsite would create
		await db.insert(product).values([
			{ name: 'Product 1', tenantId, description: 'Main product' },
			{ name: 'Product 2', tenantId, description: 'Secondary product' },
		])

		// Add dummy personas
		await db.insert(persona).values([
			{
				name: 'Developer',
				tenantId,
				description: 'Software developer using the platform',
			},
			{
				name: 'Product Manager',
				tenantId,
				description: 'Product manager defining requirements',
			},
		])

		// Update tenant with a description (as parseWebsite would do)
		await db
			.update(tenant)
			.set({
				description: 'A company that builds software tools',
				companyWebsite: 'https://example.com',
			})
			.where(eq(tenant.id, tenantId))
	}
}

interface GetOrInsertUserOptions {
	email?: User['email']
	id?: string
	internal?: boolean
	password?: string
	tenantId?: string
	username?: User['username']
	completedOnboarding?: boolean
	role?: 'admin' | 'user'
	isAdmin?: boolean // For backward compatibility
}

interface User {
	email: string
	id: string
	name: null | string
	tenantId: string
	username: string
}

async function getOrInsertUser({
	email,
	id,
	internal,
	password,
	tenantId,
	username,
	completedOnboarding = true,
	role,
	isAdmin,
}: GetOrInsertUserOptions = {}): Promise<TenantUser & User> {
	if (id) {
		const userResult = await db.query.user.findFirst({
			columns: keysToTrues(['id', 'email', 'username', 'name', 'internal']),
			where: { id },
		})

		if (!userResult) {
			throw new Error('no user found')
		}
		return userResult
	}
	const tId = tenantId ?? (await createTenant({ completedOnboarding }))
	const userData = createUser()
	username ??= userData.username
	password ??= userData.username
	email ??= userData.email

	if (!username || !password || !email) {
		throw new Error('missing user data')
	}

	// Add dummy setup data for the tenant
	await addDummySetupData(tId)

	return await db.transaction(async (tx) => {
		const [userResult] = await tx
			.insert(user)
			.values({ ...userData, internal: internal ?? false, tenantId: tId })
			.returning({
				email: user.email,
				id: user.id,
				name: user.name,
				tenantId: user.tenantId,
				username: user.username,
			})

		const userId = userResult.id

		await tx.insert(passwordSchema).values({
			tenantId: tId,
			userId: userResult.id,
			...createPassword(password),
		})

		const roleToAssign = role || (isAdmin ? 'admin' : 'user')
		const roleId = (
			await tx.query.role.findFirst({
				columns: { id: true },
				where: { name: roleToAssign, tenantId: tId },
			})
		)?.id

		if (!roleId) {
			throw new Error(`${roleToAssign} role not found`)
		}
		await tx.insert(userToRole).values({ roleId, tenantId: tId, userId })

		// If role is admin, also make sure they have the user role
		if (roleToAssign === 'admin') {
			const userRoleId = (
				await tx.query.role.findFirst({
					columns: { id: true },
					where: { name: 'user', tenantId: tId },
				})
			)?.id

			if (userRoleId) {
				await tx
					.insert(userToRole)
					.values({ roleId: userRoleId, tenantId: tId, userId })
			}
		}
		return userResult
	})
}

export const test = base.extend<{
	insertNewUser(options?: GetOrInsertUserOptions): Promise<User>
	login(options?: GetOrInsertUserOptions): Promise<User>
}>({
	insertNewUser: async ({}, use) => {
		let userId: string | undefined
		await use(async (options) => {
			const user = await getOrInsertUser(options)
			userId = user.id
			return user
		})
		if (userId) {
			await db.delete(user).where(eq(user.id, userId))
		}
	},
	login: async ({ page }, use) => {
		let userId: string | undefined
		await use(async (options) => {
			const user = await getOrInsertUser(options)

			userId = user.id
			const [sessionResult] = await db
				.insert(session)
				.values({
					expirationDate: getSessionExpirationDate(),
					tenantId: user.tenantId,
					userId: user.id,
				})
				.returning({ id: session.id })

			const authSession = await authSessionStorage.getSession()
			authSession.set(sessionKey, sessionResult.id)
			const cookieConfig = setCookieParser.parseString(
				await authSessionStorage.commitSession(authSession),
			)
			const newConfig = {
				...cookieConfig,
				domain: 'localhost',
				expires: cookieConfig.expires?.getTime(),
				sameSite: cookieConfig.sameSite as 'Lax' | 'None' | 'Strict',
			}
			await page.context().addCookies([newConfig])
			return user
		})
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (userId) {
			await db.delete(user).where(eq(user.id, userId))
		}
	},
})
export const { expect } = test

/**
 * This allows you to wait for something (like an email to be available).
 *
 * It calls the callback every 50ms until it returns a value (and does not throw
 * an error). After the timeout, it will throw the last error that was thrown or
 * throw the error message provided as a fallback
 */
export async function waitFor<ReturnValue>(
	cb: () => Promise<ReturnValue> | ReturnValue,
	{
		errorMessage,
		timeout = 5000,
	}: { errorMessage?: string; timeout?: number } = {},
) {
	const endTime = Date.now() + timeout
	let lastError: unknown = new Error(errorMessage)
	while (Date.now() < endTime) {
		try {
			const response = await cb()

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (response) {
				return response
			}
		} catch (e: unknown) {
			lastError = e
		}

		await new Promise((r) => setTimeout(r, 100))
	}

	throw lastError
}
