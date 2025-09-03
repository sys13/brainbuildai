import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkHoneypot } from '#app/utils/honeypot.server'

describe('checkHoneypot', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return false for legitimate submissions', async () => {
		const formData = new FormData()
		formData.append('email', 'user@example.com')
		formData.append('message', 'Hello!')

		const result = await checkHoneypot(formData)

		expect(result.isHoneypotSpam).toBe(false)
	})

	// Additional tests would require more complex mocking setup
	// For now, we'll focus on the core functionality test above
})
