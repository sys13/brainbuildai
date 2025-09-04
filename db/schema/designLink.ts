import { pgTable } from 'drizzle-orm/pg-core'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { prdId } from './prd'

const tableName = 'design_link'

export const designLink = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		prdId,
		url: t.text('url').notNull(),
	}),
	(table) => tenantIdIndex(tableName, table),
)
