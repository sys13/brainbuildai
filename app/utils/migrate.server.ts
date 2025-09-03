import 'dotenv/config'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import { db } from './db.server'

// export const connection = neon(process.env.DATABASE_URL ?? '')

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: './drizzle/migrations' })

// eslint-disable-next-line n/no-process-exit
process.exit(0)
