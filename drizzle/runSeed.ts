import { cleanupDb } from '#tests/db-utils.js'
import { seed } from './seed'

await cleanupDb()

await seed()
	.catch((e) => {
		console.error(e)
		// eslint-disable-next-line n/no-process-exit
		process.exit(0)
	})
	.finally(async () => {
		// eslint-disable-next-line n/no-process-exit
		process.exit()
	})
