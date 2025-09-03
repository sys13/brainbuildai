import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { prdId } from './prd'
const tableName = 'comment'

export const comment = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		prdId,
		text: text('text').notNull(),
		objectType: text('object_type').notNull(),
		objectId: text('object_id').notNull(),
		inThread: boolean('in_thread').notNull().default(false),
	}),
	(table) => tenantIdIndex(tableName, table),
)
