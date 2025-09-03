import '@playwright/test'
import type { User } from './types'

declare module '@playwright/test' {
	interface Page {
		testUser?: User
		testPassword?: string
	}
}
