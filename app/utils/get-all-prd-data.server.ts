import { db } from './db.server'
import getBackgroundInfo from './suggestions.server/get-background-info'
import getContext from './suggestions.server/get-context'
import { getDesigns } from './suggestions.server/get-designs'
import getFeatures from './suggestions.server/get-features'
import getGoals from './suggestions.server/get-goals'
import getPersonas from './suggestions.server/get-personas'
import getProblems from './suggestions.server/get-problems'
import getRisks from './suggestions.server/get-risks'
import getStories from './suggestions.server/get-stories'
import getSuccessCriteria from './suggestions.server/get-success-criteria'
import getSummary from './suggestions.server/get-summary'
import getTickets from './suggestions.server/get-tickets'
import getUserInterviews from './suggestions.server/get-user-interviews'
import type { TenantUser } from './user'

export function getAllPrdData({
	prdId,
	user,
}: {
	prdId: string
	user: TenantUser
}) {
	const tenantId = user.tenantId

	const _prdPromise = db.query.prd.findFirst({
		where: { id: prdId, tenantId },
	})

	// Context and Background Info have no dependencies
	const contextPromise = getContext({ prdId, user })
	const backgroundInfoPromise = getBackgroundInfo({ prdId, user })

	// Personas depends on context/backgroundInfo
	const personasPromise = Promise.all([
		contextPromise,
		backgroundInfoPromise,
	]).then(() => getPersonas({ prdId, user }))

	// Problems depends on personas
	const problemsPromise = personasPromise.then(() =>
		getProblems({ prdId, user }),
	)

	// Goals depends on problems
	const goalsPromise = problemsPromise.then(() => getGoals({ prdId, user }))

	// Success Criteria depends on goals
	const successCriteriaPromise = goalsPromise.then(() =>
		getSuccessCriteria({ prdId, user }),
	)

	// Features depends on success criteria
	const featuresPromise = successCriteriaPromise.then(() =>
		getFeatures({ prdId, user }),
	)

	// Stories depends on features
	const storiesPromise = featuresPromise.then(() => getStories({ prdId, user }))

	// User Interviews depends on stories
	const userInterviewsPromise = storiesPromise.then(() =>
		getUserInterviews({ prdId, user }),
	)

	// Designs depends on user interviews
	const designsPromise = userInterviewsPromise.then(() =>
		getDesigns({ prdId, user }),
	)

	// Risks depends on designs
	const risksPromise = designsPromise.then(() => getRisks({ prdId, user }))

	// Tickets depends on risks
	const ticketsPromise = risksPromise.then(() => getTickets({ prdId, user }))

	// Summary depends on everything else
	const summaryPromise = Promise.all([
		contextPromise,
		backgroundInfoPromise,
		personasPromise,
		problemsPromise,
		goalsPromise,
		successCriteriaPromise,
		featuresPromise,
		storiesPromise,
		userInterviewsPromise,
		designsPromise,
		risksPromise,
		ticketsPromise,
	]).then(() => getSummary({ prdId, user }))

	return {
		context: contextPromise,
		backgroundInfo: backgroundInfoPromise,
		personas: personasPromise,
		problems: problemsPromise,
		goals: goalsPromise,
		success_criteria: successCriteriaPromise,
		features: featuresPromise,
		stories: storiesPromise,
		userInterviews: userInterviewsPromise,
		designs: designsPromise,
		risks: risksPromise,
		tickets: ticketsPromise,
		summary: summaryPromise,
	}
}
