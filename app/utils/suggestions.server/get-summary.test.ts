import { type Mock, describe, expect, it, vi } from 'vitest'

import { db } from '#app/utils/db.server'
import getSummary from '#app/utils/suggestions.server/get-summary'

import { eq } from 'drizzle-orm'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import { tenant } from '#db/schema/base.js'
import { summary } from '#db/schema/summary'
import { createTestUserAndPrd } from '#tests/utils'

// mock your getOpenAIStructuredOutputs
vi.mock('#app/utils/open-ai-mock', () => ({
	getOpenAIStructuredOutputs: vi.fn(() => 'This is a mock summary'),
}))
describe('getSummary', () => {
	it('should return existing summary if not forced', async () => {
		const { user, prd, tenant } = await createTestUserAndPrd()
		// insert a summary manually
		await db.insert(summary).values({
			prdId: prd.id,
			tenantId: tenant.id,
			textDump: 'Existing summary',
		})

		const result = await getSummary({ prdId: prd.id, user })

		expect(result.textDump).toBe('Existing summary')
	})

	it('should call OpenAI and save if no existing summary', async () => {
		const { user, prd } = await createTestUserAndPrd()

		const result = await getSummary({ prdId: prd.id, user, force: true })

		expect(result.textDump).toBe('This is a mock summary')
	})
	it('should call OpenAI and insert summary if none exists and not forced', async () => {
		const { user, prd } = await createTestUserAndPrd()

		const result = await getSummary({ prdId: prd.id, user })

		expect(result.textDump).toBe('This is a mock summary')

		const inserted = await db.query.summary.findFirst({
			where: { prdId: prd.id },
		})
		expect(inserted?.textDump).toBe('This is a mock summary')
	})

	it('should throw if PRD not found', async () => {
		const { user } = await createTestUserAndPrd()

		await expect(() =>
			getSummary({ prdId: 'non-existent-id', user }),
		).rejects.toThrow('Project not found')
	})

	it('should throw if tenant not found', async () => {
		const { user, prd } = await createTestUserAndPrd()
		const readerUser = {
			...user,
			roles: ['reader'], // If your getPermission() uses roles
		}

		// manually remove tenant
		await db.delete(tenant).where(eq(tenant.id, user.tenantId))
		await expect(() => getSummary({ prdId: prd.id, user })).rejects.toThrow(
			'Project not found',
		)
	})
	it('should throw if OpenAI returns no response', async () => {
		const { user, prd } = await createTestUserAndPrd()
		// Mock to return null
		;(getOpenAIStructuredOutputs as Mock).mockResolvedValueOnce(null)

		await expect(() =>
			getSummary({ prdId: prd.id, user, force: true }),
		).rejects.toThrow('No responses from OpenAI')
	})
})
