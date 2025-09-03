import { db } from '#app/utils/db.server'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'

import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import getPermission from '#app/utils/get-permission.js'
import type { TenantUser } from '#app/utils/user'
import { userInterview } from '#db/schema/userInterview'
import { getAcceptedOrAll } from '../modelUtils'
import type { ExistingUserInterviewProps } from '../sort-objs'

export default async function getUserInterviews({
	moreSuggestions = 0,
	prdId,
	user,
	regenerate = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	regenerate?: boolean
}): Promise<ExistingUserInterviewProps> {
	const { tenantId, isReader, isCommenter, isEditor } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true, autoAccept: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')

	// check if there are already personas for this project
	const existingUserInterview = await db.query.userInterview.findMany({
		where: { tenantId },
	})

	// Check if there are PRD-specific user interviews
	const existingPrdUserInterview = await db.query.prdUserInterview.findMany({
		where: { tenantId, prdId }, // Filter by PRD ID to get interviews tied to a specific PRD
	})

	if (
		!regenerate &&
		existingUserInterview.length > 0 &&
		existingUserInterview.length > moreSuggestions
	) {
		return {
			// @ts-expect-error - description can be empty
			userInterviews: existingUserInterview.map((item) => ({
				...item,
				name: item.description, // 👈 Replace name with description
			})),
			prdUserInterviews: existingPrdUserInterview,
		}
	}
	if (regenerate) {
		await db
			.delete(userInterview)
			.where(
				and(
					eq(userInterview.tenantId, tenantId),
					eq(userInterview.isAddedManually, false),
				),
			)
	}
	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const [contextData, goals, problems, successCriteria, features] =
		await Promise.all([
			db.query.context
				.findFirst({
					where: { tenantId, prdId },
					columns: { textDump: true },
				})
				.then((d) => d?.textDump ?? ''), // In case no row found, fallback to empty string
			getAcceptedOrAll(db.query.goal, { tenantId, prdId }),
			getAcceptedOrAll(db.query.problem, { tenantId, prdId }),
			getAcceptedOrAll(db.query.success_criteria, { tenantId, prdId }),
			getAcceptedOrAll(db.query.feature, { tenantId, prdId }),
		])
	const responses = await getOpenAIStructuredOutputs(
		`
			You are a helpful product manager at a software company. 
			Generate exactly 5 interview question records based on the input.
			Each record should include:
			- company (always set this to the given project name)
			- customer (a sample person name)
			- description (the interview question)
			- suggestedDescription (a concise summary of possible customer feedback)
			
			Respond only with a JSON array of 5 such records.
			`,
		`
			Here is the PRD context:
			Tenant description: ${tenantData.description ?? ''}
			Project name: ${prd.name}
	
			Context: ${contextData}
			Goals: ${goals.join(', ')}
			Problems: ${problems.join(', ')}
			Success Criteria: ${successCriteria.join(', ')}
			Features: ${features.join(', ')}
	
			Generate 5 customer interview records.
			`,
		z.array(
			z.object({
				company: z.string(),
				customer: z.string(),
				description: z.string(),
				suggestedDescription: z.string(),
			}),
		),
		'userInterview',
	)
	console.log('responses', responses)
	invariant(responses && responses.length > 0, 'No responses from OpenAI')
	const shouldAutoAccept = prd.autoAccept === true
	const data = responses.map((interview) => ({
		name: interview.company || '',
		customer: interview.customer,
		description: interview.description,
		suggestedDescription: interview.suggestedDescription,
		ownerId: user.id,
		prdId: prd.id,
		tenantId,
		isAccepted: shouldAutoAccept,
	}))

	const results = await db.insert(userInterview).values(data).returning({
		createdAt: userInterview.createdAt,
		id: userInterview.id,
		isAccepted: userInterview.isAccepted,
		isAddedManually: userInterview.isAddedManually,
		isSuggested: userInterview.isSuggested,
		name: userInterview.description,
		updatedAt: userInterview.updatedAt,
	})

	return {
		// @ts-expect-error - description can be empty
		userInterviews: [...existingUserInterview, ...results],
		prdUserInterviews: existingPrdUserInterview,
	}
}
