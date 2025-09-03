import { faker } from '@faker-js/faker'
import { db } from '#app/utils/db.server.js'
import { tenant } from '#db/schema/base.js'
// tests/factories/tenant.ts

export async function createTenant(overrides = {}) {
	return db
		.insert(tenant)
		.values({
			name: faker.company.name(),
			hostname: faker.internet.domainName(),
			completedOnboarding: false,
			tier: 'free',
			...overrides,
		})
		.returning()
		.then((r) => r[0])
}
