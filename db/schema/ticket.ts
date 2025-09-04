import { pgTable } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import {
	isAccepted,
	isAddedManually,
	isSuggested,
	priority,
	standardFields,
	suggestedDescription,
	tenantIdIndex,
	vectorText,
} from '#db/schema/base'
import { prdId } from './prd'

const tableName = 'ticket'

export const ticket = pgTable(
	tableName,
	(t) => ({
		...omit(standardFields, ['description']),
		description: t.text('description'),
		isAccepted,
		isAddedManually,
		isSuggested,
		prdId,
		priority,
		suggestedDescription,
		vectorText,
		isExportedToGithub: t
			.boolean('is_exported_to_github')
			.default(false)
			.notNull(),
		isExportedToJira: t.boolean('is_exported_to_jira').default(false).notNull(),
	}),
	(table) => tenantIdIndex(tableName, table),
)
