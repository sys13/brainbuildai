import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields } from '../base'

const tableName = 'post'

export const post = pgTable(tableName, (t) => ({
	...omit(standardFields, ['tenantId', 'description']),
	content: t.text().notNull(),
	featuredImage: t.varchar({ length: 255 }),
	metaDescription: t.text(),
	metaKeywords: t.text(),
	metaTitle: t.text(),
	publishedAt: t.timestamp({ withTimezone: true }),
	slug: t.varchar({ length: 255 }).notNull(),
	status: t.text({ enum: ['draft', 'published'] }),
}))

export type NewPost = typeof post.$inferInsert
