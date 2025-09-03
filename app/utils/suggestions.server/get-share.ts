import type { ShareOptionsProps } from '#app/components/prd/prd-share.js'
import { db } from '#app/utils/db.server'
import type { TenantUser } from '#app/utils/user'
import getPermission from '../get-permission'

export default async function getShareOptions({
	prdId,
	user,
}: {
	prdId: string
	user: TenantUser
}): Promise<ShareOptionsProps> {
	const existingShareOptions = await db.query.share.findFirst({
		columns: {
			id: true,
			shareBy: true,
			shareDomain: true,
			sharePermission: true,
		},
		where: { prdId },
	})
	const existingShareEmails = await db.query.shareEmail.findMany({
		columns: {
			id: true,
			email: true,
			sharePermission: true,
		},
		where: { prdId },
	})
	const { tenantId, isEditor, isCommenter, isReader } = await getPermission({
		id: prdId,
		user,
	})

	const data: ShareOptionsProps = {
		id: existingShareOptions?.id || '',
		shareBy: existingShareOptions?.shareBy || '',
		shareDomain: existingShareOptions?.shareDomain || '',
		sharePermission: existingShareOptions?.sharePermission || 'reader',
		tenantId,
		emails: existingShareEmails,
		isEditor,
		isCommenter,
		isReader,
	}

	return data
}
