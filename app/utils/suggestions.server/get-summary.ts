import { invariant } from '@epic-web/invariant'
import { z } from 'zod'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { ExistingSummary } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { tenant } from '#db/schema/base.js'
import { summary } from '#db/schema/summary'
import { getAcceptedOrAll } from '../modelUtils'

export default async function getSummary({
	moreSuggestions = 0,
	prdId,
	user,
	force = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	force?: boolean
}): Promise<ExistingSummary> {
	const { tenantId, isReader, isCommenter, isEditor } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')
	// check if there are already problems for this project

	if (!force) {
		const existingSummary = await db.query.summary.findFirst({
			where: { tenantId, prdId: prd.id },
			columns: { textDump: true },
		})
		if (existingSummary) {
			return existingSummary
		}
	}

	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const [
		contextData,
		systemPrompt,
		goals,
		problems,
		successCriteria,
		features,
	] = await Promise.all([
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { textDump: true },
			})
			.then((d) => d?.textDump ?? ''),
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { systemPrompt: true },
			})
			.then((d) => d?.systemPrompt ?? ''),
		getAcceptedOrAll(db.query.goal, { tenantId, prdId }),
		getAcceptedOrAll(db.query.problem, { tenantId, prdId }),
		getAcceptedOrAll(db.query.success_criteria, { tenantId, prdId }),
		getAcceptedOrAll(db.query.feature, { tenantId, prdId }),
	])
	const aiResponse = await getOpenAIStructuredOutputs(
		'You are a helpful product manager for a software company. Based on the input data, generate a concise PRD summary. Keep it product-focused and helpful for internal stakeholders. Respond only with the summary text.',
		`
				Here is the PRD context:
				Tenant description: ${tenant.description ?? ''}
				Project name: ${prd.name}


				Context: ${contextData}
				Goals: ${goals.join(', ')}
				Problems: ${problems.join(', ')}
				Success Criteria: ${successCriteria.join(', ')}
				Features: ${features.join(', ')}


				Generate a concise summary of this product.

				${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}
			`,
		z.string(),
		'summary',
	)
	invariant(aiResponse, 'No responses from OpenAI')
	if (!force) {
		await db
			.insert(summary)
			.values({
				prdId,
				tenantId,
				textDump: aiResponse,
			})
			.onConflictDoUpdate({
				target: [summary.prdId],
				set: { textDump: aiResponse },
			})
			.returning({
				textDump: summary.textDump,
			})
	}

	return { textDump: aiResponse }
}
