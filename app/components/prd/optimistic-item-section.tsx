// components/prd/OptimisticItemSection.tsx

import { cn } from '#app/lib/utils.js'
import type { ExistingAndSuggestedClient } from '#app/utils/sort-objs.js'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import type { models } from '../../utils/models'
import { ListViewItem } from '../list-view-input'
import { SuggestedItem } from '../suggested-item'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type ObjType =
	| 'persona'
	| 'goal'
	| 'story'
	| 'risk'
	| 'problem'
	| 'success_criteria'
	| 'feature'
	| 'userInterview'
	| 'ticket'
type OptimisticItemSectionProps = {
	prdId: string
	items: ExistingAndSuggestedClient[]
	itemType: ObjType
	isEditor: boolean
	model: (typeof models)[ObjType]
	actionUrl: string // e.g., /resources/prd-features
}

export function OptimisticItemSection({
	prdId,
	items,
	itemType,
	isEditor,
	model,
	actionUrl,
}: OptimisticItemSectionProps) {
	const [inputValue, setInputValue] = useState('')
	const [localItems, setLocalItems] = useState<ExistingAndSuggestedClient[]>([])
	const fetcher = useFetcher()
	const submit = useDebounceSubmit()
	useEffect(() => {
		// Sync only when items update externally (e.g. initial load or after mutation)
		const acceptedFromServer = items.filter((item) => item.isAccepted)
		setLocalItems(acceptedFromServer)
	}, [items])

	const suggested = items.filter((item) => !item.isAccepted)

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		setInputValue(e.target.value)
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!inputValue.trim()) return

		const tempItem: ExistingAndSuggestedClient = {
			id: `temp-${Date.now()}`,
			name: inputValue,
			isAccepted: true,
			createdAt: new Date(),
			isAddedManually: true,
			isSuggested: false,
			priority: null,
			updatedAt: new Date(),
		}

		setLocalItems((prev) => [...prev, tempItem])

		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/add-item',
			method: 'post',
			navigate: false,
		})

		setInputValue('')
	}
	function handleAccept(item: ExistingAndSuggestedClient) {
		const acceptedItem = {
			...item,
			isAccepted: true,
			// Ensure these fields match the accepted shape
			isSuggested: false,
			isAddedManually: false,
		}

		setLocalItems((prev) => [...prev, acceptedItem])

		const formData = new FormData()
		formData.append('objId', item.id)
		formData.append('objType', itemType)
		formData.append('action', 'accept')

		fetcher.submit(formData, {
			action: '/resources/modify-suggestion',
			method: 'post',
		})
	}
	function handleRename(itemId: string, newName: string) {
		setLocalItems((prev) =>
			prev.map((item) =>
				item.id === itemId ? { ...item, name: newName } : item,
			),
		)

		const formData = new FormData()
		formData.append('id', itemId)
		formData.append('name', newName)
		formData.append('objType', model.name)

		fetcher.submit(formData, {
			action: '/resources/rename-item',
			method: 'post',
		})
	}
	function handleDelete(itemId: string) {
		setLocalItems((prev) => prev.filter((item) => item.id !== itemId))

		const formData = new FormData()
		formData.append('id', itemId)
		formData.append('objType', model.name)
		formData.append('prdId', prdId)
		formData.append('name', 'random')
		fetcher.submit(formData, {
			action: '/resources/remove-item', // Or whatever your actual route is
			method: 'post',
		})
	}
	return (
		<div>
			{isEditor && (
				<form className="mb-2" onSubmit={handleSubmit}>
					<input name="objType" type="hidden" value={itemType} />
					<input name="prdId" type="hidden" value={prdId} />
					<div className="flex space-x-2">
						<Input
							autoComplete="off"
							className="ml-0.5 focus-visible:ring-1 focus-within:ring-0 ring-offset-0 h-11"
							data-1p-ignore
							name="name"
							onChange={handleInputChange}
							placeholder="Add new..."
							type="text"
							value={inputValue}
						/>
						<Button className="ml-2 h-11 px-5" variant="outline">
							Add
						</Button>
					</div>
				</form>
			)}

			{!isEditor && localItems.length === 0 && (
				<p className="text-muted-foreground italic mb-4">
					No {itemType.replace('_', ' ')}s added yet.
				</p>
			)}

			<ul className={cn('space-y-2', !isEditor && 'list-inside list-disc')}>
				{localItems.map((item) =>
					isEditor ? (
						<ListViewItem
							key={item.id}
							item={item}
							badgeText={item.badgeText}
							model={model}
							linkToDetails
							onRename={handleRename}
							onDelete={handleDelete}
						/>
					) : (
						<li key={item.id}>{item.name}</li>
					),
				)}
			</ul>

			{isEditor && suggested.length > 0 && (
				<>
					<div className="mt-4 mb-2 flex items-center justify-between">
						<h2 className="text-sm font-bold">Suggested</h2>
						<Button
							variant="ghost"
							onClick={() =>
								fetcher.submit(
									{ prdId, regenerate: 'true', name: 'regenerate' },
									{ method: 'POST', action: actionUrl },
								)
							}
						>
							🔁 Regenerate Suggestions
						</Button>
					</div>
					<ul className="space-y-2 @2xl:space-y-0 @2xl:gap-4 @2xl:grid @2xl:grid-cols-2">
						{suggested.map((item) => (
							<SuggestedItem
								key={item.id}
								item={item}
								objType={model.name}
								prdId={prdId}
								onAccept={handleAccept}
							/>
						))}
					</ul>
				</>
			)}
		</div>
	)
}
