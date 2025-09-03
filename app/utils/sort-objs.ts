export interface ExistingClient {
	textDump: string | null
	systemPrompt?: string | null
	autoAccept?: boolean | null
}
export interface ExistingAndSuggestedClient {
	badgeText?: Promise<string>
	createdAt: Date
	id: string
	isAccepted: boolean | null
	isAddedManually: boolean | null
	isSuggested: boolean
	name: string
	priority?: 'high' | 'medium' | null
	updatedAt: Date
}
export type DesignLinkClient = {
	id: string
	url: string
	name: string
	createdAt: Date
	updatedAt: Date
}
export type Ticket = {
	id: string
	name: string
	description: string | null
	createdAt: Date
	updatedAt: Date
}
export type DesignImageClient = {
	id: string
	imageUrl: string
	createdAt: Date
	updatedAt: Date
}

export type ContextFileClient = {
	id: string
	fileUrl: string
	createdAt: Date
	updatedAt: Date
}
export interface PrdObjProps {
	id: string
	userInterviewId: string
}
export interface ExistingUserInterviewProps {
	userInterviews: ExistingAndSuggestedClient[]
	prdUserInterviews: PrdObjProps[]
}
export type IntegrationConfigClient =
	| {
			prdId: string
			githubToken: string | null
			githubRepo: string | null
			jiraEmail: string | null
			jiraApiToken: string | null
			jiraProjectKey: string | null
			jiraBaseUrl: string | null
			tenantId: string
			createdAt: Date
			updatedAt: Date
			description: string | null
			name: string
			id: string
	  }
	| undefined
export function sortByAccepted(items: ExistingAndSuggestedClient[]) {
	const accepted = items.filter((item) => item.isAccepted === true)
	const suggested = items.filter(
		(item) => item.isSuggested && item.isAccepted === null,
	)

	const isPrioritizedManual = accepted.filter(
		(item) => item.priority === 'high' && item.isAddedManually,
	)
	const isPrioritizedNotManual = accepted.filter(
		(item) => item.priority === 'high' && !item.isAddedManually,
	)

	const notPrioritizedManual = accepted.filter(
		(item) =>
			item.isAddedManually === true &&
			(item.priority === 'medium' || item.priority === null),
	)

	const notPrioritizedNotManual = accepted.filter(
		(item) =>
			!item.isAddedManually &&
			(item.priority === 'medium' || item.priority === null),
	)

	const acceptedStuff = [
		...sortedByCreatedAtRecent(isPrioritizedManual),
		...sortedByCreatedAtRecent(isPrioritizedNotManual),
		...sortedByCreatedAtRecent(notPrioritizedManual),
		...sortedByCreatedAtRecent(notPrioritizedNotManual),
	]

	return [...acceptedStuff, ...sortedByCreatedAtRecent(suggested)]
}

function sortedByCreatedAtRecent(items: ExistingAndSuggestedClient[]) {
	return items.sort((a, b) => {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	})
}
