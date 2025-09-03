// tests/factories/user.ts

import { fakerEN } from '@faker-js/faker'
import { addUser } from '#drizzle/addUser.js'
import { img } from '#tests/db-utils' // adjust based on your actual img util
import { createTenant } from './createTenant'

export async function createUser(
	overrides: Partial<Parameters<typeof addUser>[0]> = {},
) {
	const tenant = overrides.tenantId
		? { id: overrides.tenantId }
		: await createTenant()

	const firstName = fakerEN.person.firstName()
	const lastName = fakerEN.person.lastName()

	const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`
	const email = `${username}@example.com`

	const userData = {
		email,
		username,
		name: `${firstName} ${lastName}`,
		password: username, // simple default
		...overrides.userData,
	}

	const image =
		overrides.userImage ||
		(await img({ filepath: './tests/fixtures/images/user/0.jpg' }))

	const userId = await addUser({
		internal: false,
		tenantId: tenant.id,
		userData,
		userImage: image,
		...overrides,
	})

	return {
		id: userId,
		tenantId: tenant.id,
		email: userData.email,
		username: userData.username,
	}
}
