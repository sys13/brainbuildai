import type { Config } from 'drizzle-kit'

export default {
	casing: 'snake_case',
	dbCredentials: {
		url: process.env.DATABASE_URL || '',
	},
	dialect: 'postgresql',
	out: './drizzle/migrations',
	schema: './db/schema/index.ts',
} satisfies Config
