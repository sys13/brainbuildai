import { defineRelations } from 'drizzle-orm'
import * as schema from './index'

export const relations = defineRelations(schema, (r) => ({
	tenant: {
		users: r.many.user({
			from: r.tenant.id,
			to: r.user.tenantId,
		}),
		jobs: r.many.job({
			from: r.tenant.id,
			to: r.job.tenantId,
		}),
		// connections: r.many.connection({
		// 	from: r.tenant.id.through(r.connection.tenantId),
		// 	to: r.user.id.through(r.connection.userId),
		// }),
		prds: r.many.prd({
			from: r.tenant.id,
			to: r.prd.tenantId,
		}),
		personas: r.many.persona({
			from: r.tenant.id,
			to: r.persona.tenantId,
		}),
		goals: r.many.goal({
			from: r.tenant.id,
			to: r.goal.tenantId,
		}),
		problems: r.many.problem({
			from: r.tenant.id,
			to: r.problem.tenantId,
		}),
		products: r.many.product({
			from: r.tenant.id,
			to: r.product.tenantId,
		}),
		roles: r.many.role({
			from: r.tenant.id,
			to: r.role.tenantId,
		}),
		userLogins: r.many.userLogin({
			from: r.tenant.id,
			to: r.userLogin.tenantId,
		}),
	},
	user: {
		images: r.many.userImage({
			from: r.user.id,
			to: r.userImage.userId,
		}),
		connections: r.many.connection({
			from: r.user.id,
			to: r.connection.userId,
		}),
		events: r.many.event({
			from: r.user.id,
			to: r.event.userId,
		}),
		permissions: r.many.permission({
			from: r.user.id,
			to: r.permission.userId,
		}),
		sessions: r.many.session({
			from: r.user.id,
			to: r.session.userId,
		}),
		roles: r.many.userToRole({
			from: r.user.id,
			to: r.userToRole.userId,
		}),
		tenant: r.one.tenant({
			from: r.user.tenantId,
			to: r.tenant.id,
			optional: false,
		}),
		password: r.one.password({
			from: r.user.id,
			to: r.password.userId,
		}),
		userRoles: r.many.role({
			from: r.user.id.through(r.userToRole.userId),
			to: r.role.id.through(r.userToRole.roleId),
		}),
	},
	job: {},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	password: {
		user: r.one.user({
			from: r.password.userId,
			to: r.user.id,
		}),
	},
	verification: {},
	event: {},
	prd: {
		contexts: r.many.context({
			from: r.prd.id,
			to: r.context.prdId,
		}),
		prdPersonas: r.many.prdPersona({
			from: r.prd.id,
			to: r.prdPersona.personaId,
		}),
		personas: r.many.persona({
			from: r.prd.id.through(r.prdPersona.prdId),
			to: r.persona.id.through(r.prdPersona.personaId),
		}),
	},
	permission: {
		tenant: r.one.tenant({
			from: r.permission.tenantId,
			to: r.tenant.id,
		}),
		persona: r.one.persona({
			from: r.permission.personaId,
			to: r.persona.id,
		}),
		prd: r.one.prd({
			from: r.permission.prdId,
			to: r.prd.id,
		}),
		user: r.one.user({
			from: r.permission.userId,
			to: r.user.id,
		}),
	},
	persona: {},
	product: {},
	role: {},
	userLogin: {},
	userToRole: {
		role: r.one.role({
			from: r.userToRole.roleId,
			to: r.role.id,
		}),
		tenant: r.one.tenant({
			from: r.userToRole.tenantId,
			to: r.tenant.id,
		}),
		user: r.one.user({
			from: r.userToRole.userId,
			to: r.user.id,
		}),
	},
}))
