export interface Completion {
	createdAt: Date
	id: string
	isSuggested: boolean | null
	name: string
	updatedAt?: Date
}

export function sortObjs(list: Completion[]): Completion[] {
	return list.sort((a, b) => {
		// sort by suggested first, then by created date

		// sort by suggested first, then by created date

		if (a.isSuggested && !b.isSuggested) {
			return 1
		}

		if (!a.isSuggested && b.isSuggested) {
			return -1
		}

		// If isSuggested is equal, sort by createdAt

		// If isSuggested is equal, sort by createdAt
		return b.createdAt.getTime() - a.createdAt.getTime()
	})
}
