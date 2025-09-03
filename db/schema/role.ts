import { pgTable, primaryKey, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { standardFields, tenant, user } from './base'

export const role = pgTable(
	'role',
	(t) => ({
		...standardFields,
		internal: t.boolean(),
	}),
	(table) => [uniqueIndex().on(table.tenantId, table.name)],
)

export const userToRole = pgTable(
	'user_to_role',
	{
		roleId: varchar('role_id')
			.notNull()
			.references(() => role.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			})
			.notNull(),
		tenantId: varchar('tenant_id')
			.notNull()
			.references(() => tenant.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			})
			.notNull(),
		userId: varchar('user_id')
			.notNull()
			.references(() => user.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			})
			.notNull(),
	},
	(t) => [primaryKey({ columns: [t.tenantId, t.userId, t.roleId] })],
)
