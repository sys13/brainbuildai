import { pgTable } from 'drizzle-orm/pg-core'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { prdId } from './prd'
export const contextFile = pgTable(
	'context_file', // Table name
	(t) => ({
		...standardFields, // Add any standard fields you need like created_at, updated_at, etc.
		prdId,
		fileUrl: t.text('file_url').notNull(),
		textDump: t.text(),
	}),
	(table) => tenantIdIndex('context_file', table), // Ensure tenant-level indexing
)
