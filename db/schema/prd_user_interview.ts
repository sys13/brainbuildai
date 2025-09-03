import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { prd } from './prd'
import { userInterview } from './userInterview'

const tableName = 'prd_user_interview'

export const prdUserInterview = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		prdId: t
			.varchar()
			.notNull()
			.references(() => prd.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		userInterviewId: t
			.varchar()
			.notNull()
			.references(() => userInterview.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
	}),
	(table) => tenantIdIndex(tableName, table),
)
