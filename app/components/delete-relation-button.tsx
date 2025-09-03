import { useFetcher } from 'react-router'
import type { models } from '#app/utils/models'
import { Button } from './ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { Icon } from './ui/icon'

export function DeleteButton({
	doDeleteRoute = false,
	icon = false,
	model,
	name,
	objId,
	prdId,
}: {
	doDeleteRoute?: boolean
	icon?: boolean
	model: (typeof models)[keyof typeof models]
	name?: string
	objId?: string
	prdId?: string
}) {
	const fetcher = useFetcher()
	const buttonProps = icon
		? ({ size: 'icon', variant: 'ghost' } as const)
		: ({ variant: 'destructive' } as const)
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button {...buttonProps}>
					{icon ? <Icon name="trash" /> : 'Delete'}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="mb-4">
						Remove {model.displayNames.singular}
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete
						{name ? <span className="italic"> '{name}'</span> : ''}?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-4">
					<DialogClose asChild>
						<fetcher.Form
							method="POST"
							{...(doDeleteRoute ? { action: '/resources/remove-item' } : {})}
						>
							<input name="objType" type="hidden" value={model.name} />
							<input name="prdId" type="hidden" value={prdId} />
							<input name="id" type="hidden" value={objId} />
							<div className="flex justify-end">
								<Button
									name="intent"
									type="submit"
									value="remove"
									variant="destructive"
								>
									Delete
								</Button>
							</div>
						</fetcher.Form>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
