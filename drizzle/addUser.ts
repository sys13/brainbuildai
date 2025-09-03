import { db } from '#app/utils/db.server'
import { password } from '#db/schema/authentication'
import { user } from '#db/schema/base'
import { userImage as userImageSchema } from '#db/schema/userImage'
import { createPassword } from '#tests/db-utils'
import { userToRole } from '../db/schema/role'

export async function addUser({
	internal,
	tenantId,
	userData,
	userImage,
}: {
	internal?: boolean
	tenantId: string
	userData: {
		email: string
		name?: string
		password?: string
		username: string
	}
	userImage: {
		altText: string | undefined
		blob: string
		contentType: string
	}
}) {
	return await db.transaction(async (tx) => {
		const userId = (
			await tx
				.insert(user)
				.values({ ...userData, internal, tenantId })
				.returning({ id: user.id })
		)[0].id

		await tx.insert(password).values({
			tenantId,
			userId,
			...createPassword(userData.password || userData.username),
		})

		await tx.insert(userImageSchema).values({ tenantId, userId, ...userImage })

		const roleIds = await tx.query.role.findMany({
			columns: { id: true },
			where: {
				tenantId,
				name: 'user',
			},
		})
		for (const { id: roleId } of roleIds) {
			await tx.insert(userToRole).values({ roleId, tenantId, userId })
		}
		return userId
	})
}
