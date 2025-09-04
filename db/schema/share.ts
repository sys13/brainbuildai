import { pgTable, text } from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import { sharePermission, standardFields, tenantIdIndex } from '#db/schema/base'
import { prdId } from './prd'

const tableName = 'share'

export const share = pgTable(
	tableName,
	(_t) => ({
		...omit(standardFields, ['name', 'description']),
		prdId,
		shareBy: text({ enum: ['none', 'link', 'domain', 'email'] })
			.default('none')
			.notNull(),
		sharePermission,
		shareDomain: text('share_domain'),
	}),
	(table) => tenantIdIndex(tableName, table),
)
