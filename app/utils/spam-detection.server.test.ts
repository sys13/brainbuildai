import { beforeEach, describe, expect, it, vi } from 'vitest'
import { detectSpam } from '#app/utils/spam-detection.server'

describe('detectSpam', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Set MOCK_AI to true for predictable testing
		process.env.MOCK_AI = 'true'
	})

	it('should detect spam when message contains spam patterns', async () => {
		const result = await detectSpam({
			email: 'test@example.com',
			message: 'Buy now! Click here for free money!',
		})

		expect(result.isSpam).toBe(true)
		expect(result.confidence).toBeGreaterThan(0.5)
		expect(result.reason).toBe('Contains suspicious patterns')
	})

	it('should detect spam when email contains spam keyword', async () => {
		const result = await detectSpam({
			email: 'spam@example.com',
			message: 'This is a legitimate message',
		})

		expect(result.isSpam).toBe(true)
		expect(result.confidence).toBeGreaterThan(0.5)
		expect(result.reason).toBe('Contains suspicious patterns')
	})

	it('should detect spam when message is too short', async () => {
		const result = await detectSpam({
			email: 'test@example.com',
			message: 'Hi',
		})

		expect(result.isSpam).toBe(true)
		expect(result.confidence).toBeGreaterThan(0.5)
		expect(result.reason).toBe('Contains suspicious patterns')
	})

	it('should not detect spam for legitimate messages', async () => {
		const result = await detectSpam({
			email: 'user@company.com',
			message:
				'Hello, I would like to request a demo of your product. We are a growing company and interested in your AI solutions.',
		})

		expect(result.isSpam).toBe(false)
		expect(result.confidence).toBeLessThan(0.5)
		expect(result.reason).toBeNull()
	})

	it('should handle AI detection errors gracefully', async () => {
		// Set MOCK_AI to false to test error handling, but catch the actual connection error
		process.env.MOCK_AI = 'false'

		const result = await detectSpam({
			email: 'test@example.com',
			message: 'Test message',
		})

		// Since there's no internet connection, this will hit the catch block
		expect(result.isSpam).toBe(false)
		expect(result.confidence).toBe(0)
		expect(result.reason).toBe('Detection error')
	})

	it('should handle production without MOCK_AI', async () => {
		// Test that the function gracefully handles production environment
		// biome-ignore lint/performance/noDelete: <explanation>
		delete process.env.MOCK_AI

		const result = await detectSpam({
			email: 'test@example.com',
			message: 'Test message',
		})

		// Should fall back gracefully when AI is not available
		expect(result.isSpam).toBe(false)
		expect(result.confidence).toBe(0)
		expect(result.reason).toBe('AI detection failed')
	})
})
