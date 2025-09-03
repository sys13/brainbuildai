import { pgTable, varchar } from 'drizzle-orm/pg-core'
import {
	isAccepted,
	isAddedManually,
	isSuggested,
	ownerId,
	standardFields,
	tenantIdIndex,
	vectorText,
} from '#db/schema/base'

const tableName = 'prd'

export const prd = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		isAccepted,
		isAddedManually,
		isSuggested,
		ownerId,
		vectorText,
		autoAccept: t.boolean().default(false),
	}),
	(table) => tenantIdIndex(tableName, table),
)

export const prdId = varchar('prd_id')
	.notNull()
	.references(() => prd.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	})
