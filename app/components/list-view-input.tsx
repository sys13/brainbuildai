import { Suspense, useRef, useState } from 'react'
import { Await, Link, useFetcher } from 'react-router'
import { cn } from '#app/utils/misc'
import type { ExistingAndSuggestedClient, Ticket } from '#app/utils/sort-objs'
import { DeleteButton } from './delete-button'
import type { ListViewProps } from './list-view'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Input } from './ui/input'

export function ListViewItem({
	badgeText,
	item,
	linkToDetails,
	model,
	prdId,
	onRename,
	onDelete,
}: {
	badgeText?: Promise<string>
	item: ExistingAndSuggestedClient | Ticket
	linkToDetails?: boolean
	model: ListViewProps['model']
	prdId?: string
	onRename?: (id: string, newName: string) => void
	onDelete?: (id: string) => void
}) {
	const [isEditing, setIsEditing] = useState(false)
	const fetcher = useFetcher()

	const inputRef = useRef<HTMLInputElement>(null)

	const handleEditClick = () => {
		setIsEditing(true)
		setTimeout(() => {
			inputRef.current?.focus()
		}, 0)
	}

	const nonEditingItem = (
		<>
			{linkToDetails ? (
				<Link className="link line-clamp-1" to={model.detailsUrl(item.id)}>
					{item.name}
				</Link>
			) : (
				<span className="line-clamp-1">{item.name}</span>
			)}
			<Suspense>
				<Await resolve={badgeText}>
					{(text) =>
						text && (
							<Badge className="ml-2 bg-muted-foreground/20" variant="outline">
								{text}
							</Badge>
						)
					}
				</Await>
			</Suspense>
			<Button
				className="ml-2"
				onClick={handleEditClick}
				size="icon"
				variant="ghost-muted"
			>
				<Icon name="pencil" />
			</Button>
		</>
	)

	return (
		<li
			className={cn(
				'flex border border-muted rounded-md align-top justify-between bg-secondary/70',
			)}
			key={item.id}
		>
			<div className="p-1 flex items-center justify-center pl-3">
				{isEditing ? (
					<fetcher.Form
						action="/resources/rename-item"
						className="flex -ml-2"
						method="POST"
					>
						<Input
							autoComplete="off"
							className="w-full"
							data-1p-ignore
							defaultValue={item.name}
							name="name"
							ref={inputRef}
							type="text"
						/>
						<input name="id" type="hidden" value={item.id} />
						<input name="objType" type="hidden" value={model.name} />
						<Button
							className="ml-2"
							// onClick={(e) => {
							// 	setIsEditing(false)
							// 	fetcher.submit(e.currentTarget.form)
							// }}
							onClick={(e) => {
								e.preventDefault()
								const form = e.currentTarget.form
								const nameInput = form?.elements.namedItem(
									'name',
								) as HTMLInputElement | null
								const idInput = form?.elements.namedItem(
									'id',
								) as HTMLInputElement | null
								const newName = nameInput?.value
								const id = idInput?.value
								if (onRename && id && newName) {
									onRename(id, newName)
								}

								setIsEditing(false)
							}}
							size="icon"
							type="submit"
							variant="ghost-muted"
						>
							<Icon name="check" />
						</Button>
					</fetcher.Form>
				) : (
					nonEditingItem
				)}
			</div>
			<div className="flex items-center">
				<DeleteButton
					doDeleteRoute={!onDelete}
					icon
					model={model}
					name={item.name}
					objId={item.id}
					onDelete={() => onDelete?.(item.id)}
				/>
			</div>
		</li>
	)
}
