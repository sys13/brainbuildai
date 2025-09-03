import { event } from '#db/schema/event'
import { db } from '../db.server'

type EventName = 'new-pdf'

export async function createEvent({
	details,
	name,
	prdId,
	tenantId,
	userId,
}: {
	details?: string
	name: EventName
	prdId?: string
	tenantId?: string
	userId?: string
}) {
	await db.insert(event).values({ details, name, prdId, tenantId, userId })
}
