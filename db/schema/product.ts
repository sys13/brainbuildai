import { pgTable } from 'drizzle-orm/pg-core'
import {
	isAccepted,
	isAddedManually,
	isSuggested,
	priority,
	standardFields,
	suggestedDescription,
	tenantIdIndex,
	vectorText,
} from '#db/schema/base'

const tableName = 'product'

export const product = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		isAccepted,
		isAddedManually,
		isSuggested,
		priority,
		suggestedDescription,
		vectorText,
		vision: t.text('vision'),
	}),
	(table) => tenantIdIndex(tableName, table),
)
