import { db } from './db.server'

export async function getAdminUserFromTenant({
	tenantId,
}: {
	tenantId: string
}) {
	const user = await db.query.user.findFirst({
		columns: {
			id: true,
			tenantId: true,
		},
		where: {
			tenantId,
			roles: {
				tenantId: tenantId,
				role: {
					tenantId: tenantId,
					name: 'admin',
				},
			},
		},
		with: {
			roles: {
				with: {
					role: {
						columns: {
							name: true,
						},
					},
				},
			},
		},
	})
	return user
}
