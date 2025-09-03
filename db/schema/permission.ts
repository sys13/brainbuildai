import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, tenantIdIndex, user } from './base'
import { persona } from './persona'
import { prd } from './prd'

export const permission = pgTable(
	'permission',
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		personaId: t.varchar().references(() => persona.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		prdId: t.varchar().references(() => prd.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		userInterviewId: t.varchar().references(() => prd.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		ticketId: t.varchar().references(() => prd.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		privilege: t.text().notNull(),
		specialPrincipal: t.text(),
		userId: t.varchar('user_id').references(() => user.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	}),
	(table) => tenantIdIndex('permission', table),
)
