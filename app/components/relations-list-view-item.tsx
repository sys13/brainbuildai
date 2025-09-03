import { Link, useFetcher } from 'react-router'
import { type Item, cn } from '#app/utils/misc'
import type { ListViewProps } from './list-view'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export function RelationsListViewItem({
	item,
	linkToDetails,
	mainModelId,
	mainModelName,
	model,
	prdId,
}: {
	badgeText?: Promise<string>
	item: Item
	linkToDetails?: boolean
	mainModelId: string
	mainModelName: string
	model: ListViewProps['model']
	prdId?: string
}) {
	const fetcher = useFetcher()

	const nonEditingItem = (
		<>
			{linkToDetails ? (
				<Link className="link line-clamp-1" to={model.detailsUrl(item.id)}>
					{item.name}
				</Link>
			) : (
				<span className="line-clamp-1">{item.name}</span>
			)}
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
				{nonEditingItem}
			</div>
			<div className="flex items-center">
				<fetcher.Form action="/resources/remove-relation-item" method="POST">
					<input name="modelName" type="hidden" value={model.name} />
					<input name="id" type="hidden" value={item.id} />
					<input name="mainModelId" type="hidden" value={mainModelId} />
					<input name="mainModelName" type="hidden" value={mainModelName} />
					<div className="flex justify-end">
						<Button size="icon" type="submit" variant="ghost">
							<Icon name="trash" />
						</Button>
					</div>
				</fetcher.Form>
			</div>
		</li>
	)
}
