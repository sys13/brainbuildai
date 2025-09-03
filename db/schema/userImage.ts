import { pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, userId } from '#db/schema/base'

export const userImage = pgTable(
	'user_image',
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		altText: t.varchar(),
		blob: t.text().notNull(),
		contentType: t.varchar().notNull(),
		userId,
	}),
	(table) => [uniqueIndex().on(table.tenantId, table.userId)],
)
