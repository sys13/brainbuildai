import { invariant } from '@epic-web/invariant'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import type { ContextFileClient, ExistingClient } from '#app/utils/sort-objs'
import type { TenantUser } from '#app/utils/user'
export default async function getContext({
	moreSuggestions = 0,
	prdId,
	user,
	force = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	force?: boolean
}): Promise<{
	context: ExistingClient
	files: ContextFileClient[]
}> {
	const { tenantId, isReader, isCommenter, isEditor } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')
	const [context, files] = await Promise.all([
		db.query.context.findFirst({
			where: { tenantId, prdId: prd.id },
			columns: { textDump: true, systemPrompt: true },
		}),
		db.query.contextFile.findMany({
			columns: {
				id: true,
				fileUrl: true,
				createdAt: true,
				updatedAt: true,
			},
			where: { prdId, tenantId },
			orderBy: (t) => [t.createdAt],
		}),
	])
	return { context: context || { textDump: '' }, files }
}
