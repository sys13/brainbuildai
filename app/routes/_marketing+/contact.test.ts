import { beforeEach, describe, expect, it, vi } from 'vitest'
import { action } from '#app/routes/_marketing+/contact'

// Mock dependencies
vi.mock('#app/utils/auth.server', () => ({
	requireAnonymous: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('#app/utils/honeypot.server', () => ({
	checkHoneypot: vi.fn().mockResolvedValue({ isHoneypotSpam: false }),
}))

vi.mock('#app/utils/email.server', () => ({
	sendEmail: vi.fn(),
}))

vi.mock('#app/utils/spam-detection.server', () => ({
	detectSpam: vi.fn(),
}))

describe('contact form action with spam detection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should send email for legitimate messages', async () => {
		const { checkHoneypot } = await import('#app/utils/honeypot.server')
		const { detectSpam } = await import('#app/utils/spam-detection.server')
		const { sendEmail } = await import('#app/utils/email.server')

		vi.mocked(checkHoneypot).mockResolvedValueOnce({ isHoneypotSpam: false })
		vi.mocked(detectSpam).mockResolvedValueOnce({
			isSpam: false,
			confidence: 0.1,
		})

		const formData = new FormData()
		formData.append('email', 'user@example.com')
		formData.append(
			'message',
			'I would like to request a demo of your product.',
		)

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData,
		})

		const result = await action({ request, params: {}, context: {} })

		expect(detectSpam).toHaveBeenCalledWith({
			email: 'user@example.com',
			message: 'I would like to request a demo of your product.',
		})
		expect(sendEmail).toHaveBeenCalled()
		expect(result).toEqual({
			status: 'success',
			submission: expect.any(Object),
		})
	})

	it('should block high-confidence spam without sending email', async () => {
		const { checkHoneypot } = await import('#app/utils/honeypot.server')
		const { detectSpam } = await import('#app/utils/spam-detection.server')
		const { sendEmail } = await import('#app/utils/email.server')

		vi.mocked(checkHoneypot).mockResolvedValueOnce({ isHoneypotSpam: false })
		vi.mocked(detectSpam).mockResolvedValueOnce({
			isSpam: true,
			confidence: 0.9,
			reason: 'Contains suspicious patterns',
		})

		const formData = new FormData()
		formData.append('email', 'spam@example.com')
		formData.append('message', 'Buy now! Click here!')

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData,
		})

		const result = await action({ request, params: {}, context: {} })

		expect(detectSpam).toHaveBeenCalledWith({
			email: 'spam@example.com',
			message: 'Buy now! Click here!',
		})
		expect(sendEmail).not.toHaveBeenCalled()
		// Still returns success to not reveal to spammer that message was blocked
		expect(result).toEqual({
			status: 'success',
			submission: expect.any(Object),
		})
	})

	it('should send email for low-confidence spam (to avoid false positives)', async () => {
		const { checkHoneypot } = await import('#app/utils/honeypot.server')
		const { detectSpam } = await import('#app/utils/spam-detection.server')
		const { sendEmail } = await import('#app/utils/email.server')

		vi.mocked(checkHoneypot).mockResolvedValueOnce({ isHoneypotSpam: false })
		vi.mocked(detectSpam).mockResolvedValueOnce({
			isSpam: true,
			confidence: 0.5, // Below 0.7 threshold
			reason: 'Slightly suspicious',
		})

		const formData = new FormData()
		formData.append('email', 'user@example.com')
		formData.append('message', 'Quick question about pricing')

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData,
		})

		const result = await action({ request, params: {}, context: {} })

		expect(detectSpam).toHaveBeenCalled()
		expect(sendEmail).toHaveBeenCalled() // Should still send because confidence < 0.7
		expect(result).toEqual({
			status: 'success',
			submission: expect.any(Object),
		})
	})

	it('should block honeypot spam without checking AI', async () => {
		const { checkHoneypot } = await import('#app/utils/honeypot.server')
		const { detectSpam } = await import('#app/utils/spam-detection.server')
		const { sendEmail } = await import('#app/utils/email.server')

		vi.mocked(checkHoneypot).mockResolvedValueOnce({ isHoneypotSpam: true })

		const formData = new FormData()
		formData.append('email', 'user@example.com')
		formData.append('message', 'Normal message')

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData,
		})

		const result = await action({ request, params: {}, context: {} })

		expect(checkHoneypot).toHaveBeenCalled()
		expect(detectSpam).not.toHaveBeenCalled() // Should not call AI if honeypot caught it
		expect(sendEmail).not.toHaveBeenCalled()
		expect(result).toEqual({
			status: 'success',
			submission: expect.any(Object),
		})
	})
})
