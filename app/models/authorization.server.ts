import { and, count, eq, inArray } from 'drizzle-orm'
import { data } from 'react-router'
import type { Grant } from '#app/routes/resources+/_grant'
import { db } from '#app/utils/db.server'
import type { AuthModel } from '#app/utils/modelNames'
import { models } from '#app/utils/models'
import type { TenantUser } from '#app/utils/user'
import { permission } from '../../db/schema/permission'
import { getPermissions } from './permission.server'
import { filterByTenant } from './sqlUtils.server'

interface AuthProps {
	id: string
	modelName: AuthModel
	operation: 'edit' | 'manage' | 'read'
	user: TenantUser & { internal: boolean | null }
}

// authorization is false by default, then if at least one permission is found then it is true
// for external users, it must be published, then more things if it is a project
export async function canPerformOperation({
	id,
	modelName,
	operation: requiredOperation,
	user,
}: AuthProps): Promise<AuthProps['operation'][]> {
	if (!user.internal && ['edit', 'manage'].includes(requiredOperation)) {
		return []
	}

	const tenantId = user.tenantId

	const model = models[modelName]

	if (user.internal) {
		return ['read', 'edit', 'manage']

		// 	// check if user is owner
		// let ownerRecords = await db
		// 	.select({ count: count() })
		// 	.from(model.drizzleSchema)
		// 	.where(and(filterByIdAndOwner({ tenantId, id, ownerId: user.id })))
		// 	.limit(1)
		// 	.then(res => res[0].count)

		// if (ownerRecords > 0) {
		// 	return ['read', 'edit', 'manage']
		// }
	}

	// published
	// const isPublished = true
	// let isPublished = false
	// const publishedQuery = { where: { publishedStatus: 'published', tenantId } }
	// if (modelName === 'job') {
	// isPublished = (await db..count(publishedQuery)) > 0
	// const isPublished = true
	// }

	// if (!isPublished) {
	// 	return []
	// }
	// if (modelName === 'job') {
	// 	return true
	// }

	const privilege = requiredOperation === 'read' ? ['read', 'edit'] : ['edit']

	// if (modelName === 'Project') {
	// 	// for projects, check if the customerId is correct
	// 	const customerId = (await getCustomerFromUser({ user }))?.id
	// 	if (!customerId) {
	// 		return false
	// 	}
	// 	const projectExists =
	// 		(await prisma.project.count({
	// 			where: { id: objectId, customerId, tenantId },
	// 		})) > 0
	// 	if (!projectExists) {
	// 		return false
	// 	}

	// 	const specialPrincipalPermissions = await prisma.permission.count({
	// 		where: {
	// 			tenantId,
	// 			project: { id: objectId, customerId },
	// 			specialPrincipal: 'customer_users',
	// 			privilege: { in: privilege },
	// 		},
	// 	})

	// 	if (specialPrincipalPermissions > 0) {
	// 		return true
	// 	}
	// }

	// check if user has individual permissions

	const individualPermissions = await db
		.select({ count: count() })
		.from(permission)
		.where(
			and(
				filterByTenant({ tenantId }),
				eq(permission[model.idFieldName], id),
				inArray(permission.privilege, privilege),
				eq(permission.userId, user.id),
			),
		)
		.then((res) => res[0].count)

	if (individualPermissions > 0) {
		return ['read', 'edit', 'manage']
	}

	return ['read']
}

export async function requireAuthorization({
	id,
	modelName,
	operation,
	user,
}: AuthProps) {
	const privileges = await canPerformOperation({
		id,
		modelName,
		operation,
		user,
	})

	if (privileges.length === 0) {
		doThrow({ operation })
	}

	return privileges
}

export function doThrow({ operation }: Pick<AuthProps, 'operation'>) {
	throw data(
		{
			error: 'Unauthorized',
			message: `Unauthorized: required permissions: ${operation} `,
			requiredPermission: operation,
		},
		{ status: 403 },
	)
}

interface ReqAuthAndGetPermissionsReturn {
	permissions: Grant[]
	privileges: AuthProps['operation'][]
}
export async function reqAuthAndGetPermissions({
	id,
	modelName,
	operation,
	user,
}: AuthProps): Promise<ReqAuthAndGetPermissionsReturn> {
	const privileges = await requireAuthorization({
		id,
		modelName,
		operation,
		user,
	})
	const permissions = await getPermissions({
		id,
		modelName,
		user,
	})
	return { permissions, privileges }
}
