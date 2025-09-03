import { pgTable } from 'drizzle-orm/pg-core'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { prdId } from './prd'
const tableName = 'design_image'

export const designImage = pgTable(
	tableName,
	(t) => ({
		...standardFields,
		prdId,
		imageUrl: t.text('image_url').notNull(),
	}),
	(table) => tenantIdIndex(tableName, table),
)
