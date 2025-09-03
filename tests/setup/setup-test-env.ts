import '#app/utils/env.server'
import 'dotenv/config'

import './db-setup'
// we need these to be imported first 👆

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { server } from '#tests/mocks/index'

import './custom-matchers'

process.env.DATABASE_URL ??= import.meta.env.VITE_DATABASE_URL ?? ''
process.env.MOCK_AI ??= 'true'

afterEach(() => server.resetHandlers())
afterEach(() => cleanup())

// export let consoleError: MockInstance<Parameters<(typeof console)['error']>>

beforeEach(() => {
	// const originalConsoleError = console.error
	// consoleError = vi.spyOn(console, 'error')
	// consoleError.mockImplementation(
	// 	(...args: Parameters<typeof console.error>) => {
	// 		originalConsoleError(...args)
	// 		throw new Error(
	// 			'Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.',
	// 		)
	// 	},
	// )
})
