import fs from 'node:fs'
import { fakerEN } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { sql } from 'drizzle-orm'
import { UniqueEnforcer } from 'enforce-unique'
import { db } from '#app/utils/db.server'

const uniqueUsernameEnforcer = new UniqueEnforcer()

export function createUser() {
	const firstName = fakerEN.person.firstName()
	const lastName = fakerEN.person.lastName()

	const username = uniqueUsernameEnforcer
		.enforce(() => {
			return `${fakerEN.string.alphanumeric({ length: 2 })}_${fakerEN.internet.username(
				{
					firstName: firstName.toLowerCase(),
					lastName: lastName.toLowerCase(),
				},
			)}`
		})
		.slice(0, 20)
		.toLowerCase()
		.replace(/[^a-z\d_]/g, '_')
		.concat('@example.com')
	return {
		email: username,
		name: `${firstName} ${lastName}`,
		username,
	}
}

export function createPassword(password: string = fakerEN.internet.password()) {
	return {
		hash: bcrypt.hashSync(password, 10),
	}
}

let userImages: Awaited<ReturnType<typeof img>>[] | undefined
export async function getUserImages() {
	if (userImages) {
		return userImages
	}

	userImages = await Promise.all(
		Array.from({ length: 10 }, (_, index) =>
			img({ filepath: `./tests/fixtures/images/user/${index}.jpg` }),
		),
	)

	return userImages
}

export async function img({
	altText,
	filepath,
}: {
	altText?: string
	filepath: string
}) {
	return {
		altText,
		blob: (await fs.promises.readFile(filepath)).toString('base64'),
		contentType: filepath.endsWith('.png') ? 'image/png' : 'image/jpeg',
	}
}

export async function cleanupDb() {
	await db.execute(sql.raw('SET session_replication_role = replica'))

	const schemaName = 'public'
	const result = await db.execute(
		sql.raw(
			`SELECT table_name FROM information_schema.tables WHERE table_schema = '${schemaName}' AND table_name NOT LIKE '__drizzle_migrations%'`,
		),
	)
	const tables: { table_name: string }[] = result.rows as {
		table_name: string
	}[]

	for (const { table_name } of tables) {
		// Clear data from each table
		await db.execute(sql.raw(`DELETE FROM ${schemaName}.${table_name}`))
	}

	// Enable foreign key constraints
	await db.execute(sql.raw('SET session_replication_role = DEFAULT'))
}
