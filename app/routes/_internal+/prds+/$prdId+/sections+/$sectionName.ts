import { invariantResponse } from '@epic-web/invariant'
import { getUser } from '#app/utils/auth.server.js'
import getBackgroundInfo from '#app/utils/suggestions.server/get-background-info.js'
import getContext from '#app/utils/suggestions.server/get-context.js'
import { getDesigns } from '#app/utils/suggestions.server/get-designs.js'
import getFeatures from '#app/utils/suggestions.server/get-features.js'
import getGoals from '#app/utils/suggestions.server/get-goals.js'
import getPersonas from '#app/utils/suggestions.server/get-personas.js'
import getProblems from '#app/utils/suggestions.server/get-problems.js'
import getRisks from '#app/utils/suggestions.server/get-risks.js'
import getStories from '#app/utils/suggestions.server/get-stories.js'
import getSuccessCriteria from '#app/utils/suggestions.server/get-success-criteria.js'
import getSummary from '#app/utils/suggestions.server/get-summary.js'
import getTickets from '#app/utils/suggestions.server/get-tickets.js'
import getUserInterviews from '#app/utils/suggestions.server/get-user-interviews.js'
import type { Route } from '../+types/_prd_id.index'

// routes/PRDs/$prdId/sections/$sectionName.ts
export const loader = async ({ params, request }: Route.LoaderArgs) => {
	const { prdId, sectionName } = params
	invariantResponse(prdId, 'Not found', { status: 403 })

	const user = await getUser(request)
	invariantResponse(user, 'Not found', { status: 403 })
	switch (sectionName) {
		case 'context':
			return await getContext({ prdId, user })
		case 'background_info':
			return await getBackgroundInfo({ prdId, user })
		case 'personas':
			return await getPersonas({ prdId, user })
		case 'problems':
			return await getProblems({ prdId, user })
		case 'goals':
			return await getGoals({ prdId, user })
		case 'success_criteria':
			return await getSuccessCriteria({ prdId, user })
		case 'features':
			return await getFeatures({ prdId, user })
		case 'stories':
			return await getStories({ prdId, user })
		case 'user_interviews':
			return await getUserInterviews({ prdId, user })
		case 'designs':
			return await getDesigns({ prdId, user })
		case 'risks':
			return await getRisks({ prdId, user })
		case 'tickets':
			return await getTickets({ prdId, user })
		case 'summary':
			return await getSummary({ prdId, user })
		default:
			throw new Response('Unknown section', { status: 404 })
	}
}
