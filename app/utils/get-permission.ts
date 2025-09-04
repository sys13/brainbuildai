import { db } from '#app/utils/db.server'
import type { TenantUser } from '#app/utils/user'

const _entities = ['prd', 'persona', 'goal', 'feature'] as const

interface PermissionProps {
	isReader: boolean
	isCommenter: boolean
	isEditor: boolean
	tenantId: string
}

export default async function getPermission({
	id,
	user: currentUser,
}: {
	id: string
	user: TenantUser
}): Promise<PermissionProps> {
	const permissions: PermissionProps = {
		isReader: true,
		isCommenter: true,
		isEditor: true,
		tenantId: currentUser.tenantId,
	}

	const existingShareOptions = await db.query.share.findFirst({
		where: { prdId: id },
	})

	if (currentUser.tenantId === existingShareOptions?.tenantId)
		return permissions

	if (!existingShareOptions || existingShareOptions.shareBy === 'none')
		return {
			isReader: false,
			isCommenter: false,
			isEditor: false,
			tenantId: currentUser.tenantId,
		}

	permissions.isEditor = existingShareOptions?.sharePermission === 'editor'
	permissions.isCommenter =
		existingShareOptions?.sharePermission === 'commenter' ||
		existingShareOptions?.sharePermission === 'editor'
	permissions.isReader =
		existingShareOptions?.sharePermission === 'reader' ||
		existingShareOptions?.sharePermission === 'commenter' ||
		existingShareOptions?.sharePermission === 'editor'

	if (
		existingShareOptions?.shareBy === 'email' ||
		existingShareOptions?.shareBy === 'domain'
	) {
		const existingUser = await db.query.user.findFirst({
			columns: { email: true },
			where: {
				id: currentUser.id,
			},
		})

		if (
			existingShareOptions.shareBy === 'domain' &&
			!existingUser?.email.includes(existingShareOptions.shareDomain || '')
		) {
			permissions.isReader = false
			permissions.isCommenter = false
			permissions.isEditor = false
			return permissions
		}

		const existingShareEmail = await db.query.shareEmail.findFirst({
			columns: {
				email: true,
				sharePermission: true,
			},
			where: { prdId: id, email: existingUser?.email },
		})

		if (existingShareEmail) {
			permissions.isEditor = existingShareEmail?.sharePermission === 'editor'
			permissions.isCommenter =
				existingShareEmail?.sharePermission === 'commenter' ||
				existingShareEmail?.sharePermission === 'editor'
			permissions.isReader =
				existingShareEmail?.sharePermission === 'reader' ||
				existingShareEmail?.sharePermission === 'commenter' ||
				existingShareEmail?.sharePermission === 'editor'
			return permissions
		}

		permissions.isReader = false
		permissions.isCommenter = false
		permissions.isEditor = false
		return permissions
	}

	return permissions
}
