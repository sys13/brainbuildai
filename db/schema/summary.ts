import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { prd } from './prd'

const tableName = 'summary'

export const summary = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		prdId: t
			.varchar()
			.references(() => prd.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			})
			.unique()
			.notNull(),
		textDump: t.text(),
		website: t.text(),
	}),
	(table) => tenantIdIndex(tableName, table),
)
