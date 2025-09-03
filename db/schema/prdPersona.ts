import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { standardFields, tenantIdIndex } from '#db/schema/base'
import { persona } from './persona'
import { prdId } from './prd'

const tableName = 'prd_persona'

export const prdPersona = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		personaId: t
			.varchar()
			.notNull()
			.references(() => persona.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		prdId,
	}),
	(table) => tenantIdIndex(tableName, table),
)
