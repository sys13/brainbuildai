import { z } from 'zod'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'

// Use this in an API route or server action
export async function getContextSummary({
	textDump,
}: {
	textDump: string
}): Promise<string | null> {
	if (!textDump || textDump.trim().length === 0) {
		throw new Error('Context text is empty')
	}

	return getOpenAIStructuredOutputs(
		'You are a helpful product manager. Summarize the provided document content into a clear, concise product context suitable for a Product Requirements Document (PRD). Focus on product background, market need, and user motivation. Respond only with the summary.',

		`Here is the extracted content from the uploaded document:

        ${textDump}

        Summarize this into a short PRD context section.
      `,

		z.string(),
		'context-summary',
	)
}
