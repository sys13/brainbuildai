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

const tableName = 'persona'

export const persona = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		isAccepted,
		isAddedManually,
		isSuggested,
		priority,
		suggestedDescription,
		vectorText,
	}),
	(table) => tenantIdIndex(tableName, table),
)
