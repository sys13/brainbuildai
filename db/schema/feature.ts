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
import { prdId } from './prd'

const tableName = 'feature'

export const feature = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		isAccepted,
		isAddedManually,
		isSuggested,
		prdId,
		priority,
		suggestedDescription,
		vectorText,
	}),
	(table) => tenantIdIndex(tableName, table),
)
