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
const tableName = 'user_interview'

export const userInterview = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		isAccepted,
		isAddedManually,
		isSuggested,
		priority,
		suggestedDescription,
		vectorText,
		customer: t.text().notNull(),
	}),
	(table) => tenantIdIndex(tableName, table),
)
