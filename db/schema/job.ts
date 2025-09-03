import { pgTable } from 'drizzle-orm/pg-core'
import { standardFields, tenantId, tenantIdIndex } from '#db/schema/base'

const tableName = 'job'

export const job = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		jobType: t.text({ enum: ['parseWebsite'] }),
		data: t.jsonb(),
		tenantId,
		status: t.text({ enum: ['pending', 'processing', 'complete', 'error'] }),
	}),
	(table) => tenantIdIndex(tableName, table),
)
