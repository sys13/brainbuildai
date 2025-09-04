import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import {
	type AnyPgColumn,
	boolean,
	customType,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core'

export const primaryId = {
	id: varchar('id')
		.$defaultFn(() => createId())
		.notNull()
		.primaryKey(),
}

export const createdAndUpdated = {
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.default(sql`now()`),
}

export const nameAndDescription = {
	description: varchar('description'),
	name: varchar('name').notNull(),
}

export const tenant = pgTable('tenant', (t) => ({
	...primaryId,
	...createdAndUpdated,
	completedOnboarding: t.boolean().default(false),
	hostname: t.varchar(),
	initialEmail: t.varchar(),
	name: t.varchar().notNull(),
	stripeCustomerId: t.varchar(),
	tier: t.varchar(),
	whatToBuild: t.varchar(),
	companyWebsite: t.varchar().default(''),
	description: t.text(),
}))

export const tenantId = varchar('tenant_id')
	.notNull()
	.references(() => tenant.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	})

export const user = pgTable(
	'user',
	(t) => ({
		...primaryId,
		email: t.varchar().notNull(),
		name: t.varchar(),
		username: t.varchar().notNull(),
		...createdAndUpdated,
		internal: t.boolean().default(false),
		marketingEmails: t.boolean().default(false),
		tenantId,
	}),
	(table) => [
		uniqueIndex('user_email_key').on(table.email),
		uniqueIndex('user_tenantIdKey').on(table.tenantId, table.id),
		uniqueIndex('user_username_key').on(table.username),
	],
)

export const ownerId = varchar('owner_id')
	.notNull()
	.references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })

export const userId = varchar('user_id')
	.notNull()
	.references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })

const tsvector = customType<{
	config: { sources: [string] }
	data: string
}>({
	dataType(config) {
		if (config) {
			// const sources = config.sources.join(" || ' ' || ")
			const sources = config.sources[0]
			return `tsvector GENERATED ALWAYS AS (to_tsvector('english', ${sources})) STORED`
		}
		return 'tsvector'
	},
})

export const vectorText = tsvector('vector_text', {
	sources: ['name'],
})

export const standardFields = {
	...primaryId,
	...nameAndDescription,
	...createdAndUpdated,
	// ownerId,
	tenantId,
	// vectorText,
}

export function tenantIdIndex(
	_name: string,
	table: Record<string, AnyPgColumn>,
) {
	if (!('tenantId' in table) || !('id' in table)) {
		throw new Error('id or tenantId not found')
	}

	return [uniqueIndex().on(table.tenantId, table.id)]
}

export const priority = text('priority', { enum: ['medium', 'high'] })

// if it came from OpenAI or template
export const isSuggested = boolean('is_suggested').default(true).notNull()

// when adding manually something is accepted. Can be accepted false if it was rejected
export const isAccepted = boolean('is_accepted')

export const isAddedManually = boolean('is_added_manually')

export const suggestedDescription = text('suggested_description')

export const sharePermission = text({ enum: ['reader', 'commenter', 'editor'] })
	.default('reader')
	.notNull()
