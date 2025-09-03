import React, { useState } from 'react'
import { useSearchParams, useSubmit } from 'react-router'
import type { models } from '#app/utils/models'
import {
	type ExistingAndSuggestedClient,
	sortByAccepted,
} from '#app/utils/sort-objs'
import { ListViewItem } from './list-view-input'
import { SuggestedItem } from './suggested-item'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Input } from './ui/input'
import { UpgradeDialog } from './upgrade-dialog'

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
export interface ListViewProps {
	askForMore?: boolean
	hasTier?: boolean
	items: ExistingAndSuggestedClient[]
	linkToDetails?: boolean
	model: (typeof models)[ObjType]
	parentObjId?: string
	prdId?: string
	showAddItem?: boolean
	showSuggested?: boolean
}
export function ListView({
	askForMore = true,
	hasTier = true,
	items,
	model,
	parentObjId,
	prdId,
	showAddItem = true,
	showSuggested = true,
}: ListViewProps) {
	const acceptedItems = sortByAccepted(items.filter((item) => item.isAccepted))
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const buttonRef = React.useRef<HTMLButtonElement>(null)
	const [, setSearchParams] = useSearchParams()
	const handleSubmit = (e: React.FormEvent) => {
		if (!hasTier) {
			buttonRef.current?.click()
			e.preventDefault()
			return
		}
		e.preventDefault()
		// Call your submit function here
		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/add-item',
			method: 'post',
			navigate: false,
		})
		setInputValue('')
	}

	const sortedAndFiltered = sortByAccepted(items)
	const [inputValue, setInputValue] = useState('')
	const submit = useSubmit()

	return (
		<div>
			<UpgradeDialog willTrigger={!hasTier}>
				<Button className="hidden" ref={buttonRef}>
					Shadow
				</Button>
			</UpgradeDialog>
			{showAddItem && (
				<form className="mb-2" onSubmit={handleSubmit}>
					<input name="objType" type="hidden" value={model.name} />
					{prdId && <input name="prdId" type="hidden" value={prdId} />}
					<input name="parentObjId" type="hidden" value={parentObjId} />
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
						<UpgradeDialog willTrigger={!hasTier}>
							<Button
								className="ml-2 h-11 px-5"
								onClick={(e) => {
									if (!hasTier) {
										return
									}
									handleSubmit(e)
								}}
								// type="submit"
								variant="outline"
							>
								Add
							</Button>
						</UpgradeDialog>
					</div>
				</form>
			)}
			<div>
				<ul className="space-y-2">
					{acceptedItems
						.filter((item) => item.isAccepted)
						.map((item) => (
							<ListViewItem
								badgeText={item.badgeText}
								item={item}
								key={item.id}
								linkToDetails
								model={model}
								prdId={prdId}
							/>
						))}
				</ul>
			</div>
			{showSuggested && (
				<div>
					<h2 className="mt-4 text-lg font-bold mb-2">
						Suggested
						<UpgradeDialog willTrigger={!hasTier}>
							<Button
								onClick={(e) => {
									e.currentTarget.blur()
									if (askForMore) {
										const params = new URLSearchParams()
										params.set('moreSuggestions', items.length.toString())
										setSearchParams(params, {
											preventScrollReset: true,
										})
									}
								}}
								variant="link"
							>
								<Icon className="" name="wand-2">
									More
								</Icon>
							</Button>
						</UpgradeDialog>
					</h2>
					<ul className="space-y-2 @2xl:space-y-0 @2xl:gap-4 @2xl:grid @2xl:grid-cols-2">
						{sortedAndFiltered
							.filter((item) => !item.isAccepted)
							.map((item) => (
								<SuggestedItem
									hasTier={hasTier}
									item={item}
									key={item.id}
									objType={model.name}
									prdId={prdId}
								/>
							))}
					</ul>
				</div>
			)}
		</div>
	)
}
