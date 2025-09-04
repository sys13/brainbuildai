import { cn } from '#app/utils/misc'
import { models } from '#app/utils/models'
import type { ExistingAndSuggestedClient } from '#app/utils/sort-objs'
import { Link, useSubmit } from 'react-router'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

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

export function SuggestedItem({
	getBadgeTextFromObj,
	item,
	linkToDetails,
	objType,
	onAccept,
}: {
	getBadgeTextFromObj?: (obj: unknown) => string
	hasTier?: boolean
	item: ExistingAndSuggestedClient
	linkToDetails?: boolean
	objType: ObjType
	prdId?: string
	onAccept?: (item: ExistingAndSuggestedClient) => void
}) {
	const _submit = useSubmit()
	const model = models[objType]
	return (
		<li
			className={cn(
				'flex border border-muted rounded-md align-top justify-between pl-1 bg-secondary/70',
			)}
			key={item.id}
		>
			<div className="p-2 flex items-center justify-center">
				{linkToDetails ? (
					<Link className="link" to={model.detailsUrl(item.id)}>
						{item.name}
					</Link>
				) : (
					item.name
				)}
				{getBadgeTextFromObj && (
					<Badge className="ml-2">{getBadgeTextFromObj(item)}</Badge>
				)}
			</div>
			<div className="flex items-center">
				{item.isAccepted !== true && (
					<Button
						// onClick={() => {
						// 	const formData = new FormData()
						// 	formData.append('objId', item.id)
						// 	formData.append('objType', objType)
						// 	formData.append('action', 'accept')
						// 	submit(formData, {
						// 		action: '/resources/modify-suggestion',
						// 		flushSync: true,
						// 		method: 'post',
						// 		navigate: false,
						// 	})
						// }}
						onClick={() => {
							if (onAccept) {
								onAccept(item)
							}
						}}
						size="icon"
						variant="ghost-muted"
					>
						<Icon name="plus" />
					</Button>
				)}
			</div>
		</li>
	)
}
