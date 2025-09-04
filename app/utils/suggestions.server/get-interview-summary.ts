import OpenAI from 'openai'
import { z } from 'zod'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'

const _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function getAiSummary({
	company,
	notes,
	customer,
}: {
	company: string
	notes: string
	customer?: string
}): Promise<string | null> {
	return getOpenAIStructuredOutputs(
		'You summarize user interviews for product insights.',
		`You are a product manager summarizing user interviews to extract product insights.

	Here are the details of the interview:
	- Company: ${company}
	- Interviewee(s): ${customer}
	- Notes: ${notes}

	Write a concise summary (1–2 sentences) that captures the most relevant themes, problems, or feedback that could influence product decisions.
	Avoid greetings or bullet points. Focus on clarity and insight.
	Do not include greetings or bullet points.
	`,
		z.string(),
		'summary',
	)
}
