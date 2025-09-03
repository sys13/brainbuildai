import { useFetchers } from 'react-router'
import type { ModelName } from './modelNames'

export function usePendingItems(fetcherName: string) {
	type PendingItem = ReturnType<typeof useFetchers>[number] & {
		formData: FormData
	}

	return useFetchers()
		.filter((fetcher): fetcher is PendingItem => {
			if (!fetcher.formData) {
				return false
			}

			return fetcher.formData.get('intent') === fetcherName
		})
		.map((fetcher) => {
			const name = String(fetcher.formData.get('name'))
			return { id: 'pending', name }
		})
}

export function getPendingItems<T extends ModelName>(names: T[]) {
	return Object.fromEntries(
		names.map((name) => [name, usePendingItems(`add${name}` as const)]),
	) as Record<T, ReturnType<typeof usePendingItems>>
}
