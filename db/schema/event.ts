import { pgTable } from 'drizzle-orm/pg-core'
import {
	createdAndUpdated,
	primaryId,
	tenant,
	tenantIdIndex,
	user,
} from '#db/schema/base'
import { prd } from './prd'

const tableName = 'event'

export const event = pgTable(
	tableName,
	(t) => ({
		...primaryId,
		...createdAndUpdated,
		details: t.jsonb(),
		name: t.text().notNull(),
		prdId: t.varchar().references(() => prd.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		tenantId: t.varchar().references(() => tenant.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		userId: t.varchar().references(() => user.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	}),
	(table) => tenantIdIndex(tableName, table),
)
