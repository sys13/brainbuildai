import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, tenantIdIndex } from '#db/schema/base'

const tableName = 'user_login'

export const userLogin = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		date: t.date().notNull(),
		numLogins: t.integer(),
	}),
	(table) => tenantIdIndex(tableName, table),
)
