import { pgTable, text } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { sharePermission, standardFields, tenantIdIndex } from '#db/schema/base'
import { prdId } from './prd'
const tableName = 'share_email'

export const shareEmail = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		prdId,
		email: text('email').notNull(),
		sharePermission,
	}),
	(table) => tenantIdIndex(tableName, table),
)
