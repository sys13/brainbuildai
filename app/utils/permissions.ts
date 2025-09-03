import { data } from 'react-router'
import { requireUser } from './auth.server'
import { db } from './db.server'
import type { useUser } from './user'

export async function requireUserWithRole(request: Request, name: string) {
	const { id: userId, tenantId } = await requireUser(request)

	const userResult = await db.query.user.findFirst({
		columns: { id: true },
		where: {
			id: userId,
			tenantId,
			userRoles: { name },
		},
	})
	// const user  = db.query.user.findFirst({ where: and(eq(user.id, userId), eq(user.tenantId, tenantId)) , columns: { id: true }, with: { roles: { columns: { }}}} )
	if (!userResult) {
		throw data(
			{
				error: 'Unauthorized',
				message: `Unauthorized: required role: ${name}`,
				requiredRole: name,
			},
			{ status: 403 },
		)
	}

	return userResult.id
}

export function userHasRole(
	user: null | Pick<ReturnType<typeof useUser>, 'roles'>,
	role: string,
) {
	if (!user) {
		return false
	}
	return user.roles.some(({ role: r }) => r?.name === role)
}
