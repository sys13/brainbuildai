import { z } from 'zod'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'

const SpamDetectionSchema = z.object({
	isSpam: z.boolean(),
	confidence: z.number().min(0).max(1),
	reason: z.string().nullable(),
})

export async function detectSpam({
	email,
	message,
}: {
	email: string
	message: string
}): Promise<{ isSpam: boolean; confidence: number; reason?: string | null }> {
	try {
		const response = await getOpenAIStructuredOutputs(
			'You are a spam detection system for a contact form. Analyze the email and message content to determine if it is spam. Consider factors like: promotional language, suspicious links, nonsensical content, obvious bot-generated text, excessive marketing language, and low-effort messages. Return a boolean indicating if it is spam, a confidence score between 0 and 1, and optionally a brief reason.',
			`Email: ${email}\nMessage: ${message}`,
			SpamDetectionSchema,
			'spamDetection',
		)

		if (!response) {
			// If AI fails, err on the side of caution and allow the message
			return {
				isSpam: false,
				confidence: 0,
				reason: 'AI detection failed',
			}
		}

		return response
	} catch (error) {
		console.error('Error detecting spam:', error)
		// If there's an error, allow the message through
		return {
			isSpam: false,
			confidence: 0,
			reason: 'Detection error',
		}
	}
}
