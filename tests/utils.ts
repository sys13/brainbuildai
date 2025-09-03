import * as setCookieParser from 'set-cookie-parser'
import { sessionKey } from '#app/utils/auth.server'
import { authSessionStorage } from '#app/utils/session.server'
import { createPrd } from './factories/createPrd'
import { createTenant } from './factories/createTenant'
import { createUser } from './factories/createUser'
import { createTestPrd } from './setup/seed-prd'

export const BASE_URL = 'https://www.epicstack.dev'

export function convertSetCookieToCookie(setCookie: string) {
	const parsedCookie = setCookieParser.parseString(setCookie)
	return new URLSearchParams({
		[parsedCookie.name]: parsedCookie.value,
	}).toString()
}

export async function getSessionSetCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const authSession = await authSessionStorage.getSession(existingCookie)
	authSession.set(sessionKey, session.id)
	const setCookieHeader = await authSessionStorage.commitSession(authSession)
	return setCookieHeader
}

export async function getSessionCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const setCookieHeader = await getSessionSetCookieHeader(
		session,
		existingCookie,
	)
	return convertSetCookieToCookie(setCookieHeader)
}

export async function seedTestPrd() {
	const tenantId = 'test-tenant-id'
	const userId = 'test-user-id'

	// You can also ensure these exist in the db if needed
	return await createTestPrd({ tenantId, userId })
}

export async function createTestUserAndPrd() {
	const tenant = await createTenant()
	const user = await createUser({ tenantId: tenant.id })
	const prd = await createPrd({ ownerId: user.id, tenantId: user.tenantId })

	return { user, tenant, prd }
}
