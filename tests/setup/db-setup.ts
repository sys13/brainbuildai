import { afterAll, afterEach, beforeAll } from 'vitest'

process.env.DATABASE_URL ??= import.meta.env.VITE_DATABASE_URL ?? ''

beforeAll(async () => {
	// Add your code here if needed
})

// we *must* use dynamic imports here so the process.env.DATABASE_URL is set
// before prisma is imported and initialized
afterEach(async () => {
	await import('#app/utils/db.server')
})

afterAll(async () => {
	// await db..end()
})
