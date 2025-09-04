import { and, eq } from 'drizzle-orm'
import { type Grant, grantsSchema } from '#app/routes/resources+/_grant'
import { db } from '#app/utils/db.server'
import type { AuthModel } from '#app/utils/modelNames'
import { models } from '#app/utils/models'
import type { TenantUser } from '#app/utils/user'
import { permission } from '#db/schema/permission'
import { filterByTenant } from './sqlUtils.server'

interface GetPermissionsProps {
	id: string
	modelName: AuthModel
	user: TenantUser & { internal: boolean | null }
}

export async function getPermissions({
	id,
	modelName,
	user,
}: GetPermissionsProps): Promise<Grant[]> {
	const tenantId = user.tenantId

	// if (!user.internal) {
	// 	throw new Error('User is not internal')
	// }
	const _objectIdFilter = eq(permission[models[modelName].idFieldName], id)
	const fieldName = models[modelName].idFieldName
	const permissions = await db.query.permission.findMany({
		where: {
			tenantId,
			[fieldName]: id,
		},
	})
	const grants = removeUndefined(
		permissions.map(({ privilege: priv, specialPrincipal, userId }) => {
			const privilege = priv as 'edit' | 'read'

			if (!(specialPrincipal || userId)) {
				throw new Error('Invalid permission')
			}

			if (specialPrincipal) {
				// return {
				// 	principal: {
				// 		id: specialPrincipal as 'customer_users',
				// 		label: 'Customer Users',
				// 		type: 'special',
				// 	},
				// 	privilege,
				// }
			} else if (userId) {
				return {
					principal: {
						id: userId,
						type: 'user',
					},
					privilege,
				}
			}

			return {}
		}),
	)

	return grantsSchema.parse(grants)
}

interface SetPermissionsProps {
	modelName: AuthModel
	objectId: string
	permissions: Grant[]
	publishedStatus: 'internal' | 'published'
	user: TenantUser & { internal: boolean }
}

export async function setPermissions({
	modelName: objectType,
	objectId,
	permissions,
	user,
}: SetPermissionsProps) {
	const tenantId = user.tenantId
	if (!user.internal) {
		throw new Error('User is not internal')
	}

	const model = models[objectType]

	const objIdField = permission[model.idFieldName]
	await db
		.delete(permission)
		.where(and(filterByTenant({ tenantId }), eq(objIdField, objectId)))

	return Promise.all(
		permissions.map(({ principal: { id, type }, privilege }) => {
			let principalData = {}
			if (type === 'special') {
				principalData = {
					specialPrincipal: id,
				}
			} else if (type === 'user') {
				principalData = {
					userId: id,
				}
			}

			return db.insert(permission).values({
				privilege,
				tenantId,
				...principalData,
				...{ [model.idFieldName]: objectId },
			})
		}),
	)
}

function removeUndefined<T>(array: (T | undefined)[]): T[] {
	return array.filter((element): element is T => element !== undefined)
}
