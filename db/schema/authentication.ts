import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core'
import { omit } from '#app/utils/lodash'
import {
	createdAndUpdated,
	primaryId,
	standardFields,
	tenantId,
	userId,
} from '#db/schema/base'

export const session = pgTable(
	'session',
	(t) => ({
		...omit(standardFields, ['name', 'description']),
		// ...omit(standardFields, ['name', 'description', 'ownerId', 'vectorText']),
		expirationDate: t.timestamp().notNull(),
		userId,
	}),
	(table) => [index().on(table.tenantId, table.userId)],
)

export const password = pgTable(
	'password',
	{
		hash: varchar('hash').notNull(),
		tenantId,
		userId,
	},
	(table) => [uniqueIndex().on(table.tenantId, table.userId)],
)

export const verification = pgTable(
	'verification',
	{
		...primaryId,
		algorithm: varchar('algorithm').notNull(),
		charSet: varchar('charSet').notNull(),
		createdAt: createdAndUpdated.createdAt,
		digits: integer('digits').notNull(),
		expiresAt: timestamp('expiresAt'),
		internal: boolean('internal').notNull().default(false),
		period: integer('period').notNull(),
		secret: varchar('secret').notNull(),
		target: varchar('target').notNull(),
		tenantId,
		type: varchar('type').notNull(),
		whatToBuild: varchar('what_to_build'),
	},
	(table) => [uniqueIndex().on(table.target, table.type)],
)

export const connection = pgTable(
	'connection',
	{
		...omit(standardFields, ['name', 'description']),
		providerId: varchar('providerId').notNull(),
		providerName: varchar('providerName').notNull(),
		userId,
	},
	(table) => [
		uniqueIndex().on(table.tenantId, table.providerName, table.providerId),
	],
)
