import { inArray } from 'drizzle-orm'
import { db } from '#app/utils/db.server'
import { user } from '#db/schema/base'
export interface CommentProps {
	id: string
	prdId: string
	text: string
	objectType: string
	objectId: string
	inThread: boolean
}

export interface ExtendedCommentProps extends CommentProps {
	userName: string
	userEmail?: string
	userImage?: string
}
export default async function getComments({
	prdId,
}: { prdId: string }): Promise<ExtendedCommentProps[]> {
	const existingComments = await db.query.comment.findMany({
		columns: {
			id: true,
			prdId: true,
			text: true,
			objectType: true,
			objectId: true,
			inThread: true,
			tenantId: true,
		},
		where: { prdId },
	})
	const usersIds: string[] = existingComments.map((comment) => comment.tenantId)
	const users = await db
		.select()
		.from(user)
		.where(inArray(user.tenantId, usersIds))

	return (
		existingComments.map((item) => ({
			...item,
			userName:
				users.find((user) => user.tenantId === item.tenantId)?.name || '',
		})) || []
	)
}
