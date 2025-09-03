import { type ReactNode, useRef, useState } from 'react'
import { Form, Link, useFetcher } from 'react-router'
import type { Grant } from '#app/routes/resources+/_grant'
import type { models } from '#app/utils/models'
import { useUser } from '#app/utils/user'
import type { Breadcrumb } from './breadcrumbs'
import { DeleteButton } from './delete-button'
import ButtonLink from './link-button'
import type { ModeType } from './prd/prd-mode'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Input } from './ui/input'

const externalBaseURL = '/app'

export function Heading<T extends keyof typeof models>(
	props: {
		homeUrl?: string
		isExternal?: boolean
		noBreadcrumbs?: boolean
		noHome?: boolean
		prdId?: string
		mode?: ModeType
	} & (
		| {
				breadcrumbs?: Breadcrumb[]
				rightButtons?: React.ReactNode
				title: string
		  }
		| {
				canDelete: boolean
				canEdit: boolean
				id: string
				isStarred?: boolean
				model: (typeof models)[T]
				name: string
				permissions: Grant[]
				rightButtons?: React.ReactNode
				type: 'details' | 'edit'
		  }
		| {
				model: (typeof models)[T]
				rightButtons?: React.ReactNode
				type: 'list' | 'new'
		  }
		| {
				title: string
				type: 'settings'
		  }
	),
) {
	const [isEditing, setIsEditing] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const handleEditClick = () => {
		if (!('canEdit' in props) || !props.canEdit) return
		setIsEditing(true)
		setTimeout(() => {
			inputRef.current?.focus()
		}, 0)
	}
	let newTitle = ''
	let pageDescription = ''
	const user = useUser()
	const isExternal = !user.internal
	const fetcher = useFetcher()
	let rightButtons: ReactNode

	if (!('type' in props)) {
		rightButtons = props.rightButtons
		newTitle = props.title
	} else if (props.type === 'settings') {
		newTitle = props.title
		rightButtons = (
			<div className="flex gap-x-3 flex-wrap">
				{user.internal ? (
					<ButtonLink className="" to="/admin" variant="secondary">
						Admin
					</ButtonLink>
				) : null}
				<Form action="/logout" className="" method="POST">
					<Button type="submit" variant="link">
						<Icon className="scale-125 max-md:scale-150" name="exit">
							Logout
						</Icon>
					</Button>
				</Form>
			</div>
		)
	} else {
		const { model, type } = props
		// const starable = 'starable' in model && model.starable
		switch (type) {
			case 'details':
				newTitle = props.name
				rightButtons = (
					<div className="flex gap-3 flex-wrap">
						{/* {starable ? (
							<StarButton
								isStarred={!!props.isStarred}
								modelId={props.id}
								modelName={model.name}
							/>
						) : null} */}
						{/* <Share
							// initialPublishedStatus={data.material.publishedStatus}
							customerId={undefined}
							customerUsers={[]}
							existingGrants={props.permissions}
							id={props.id}
							initialPublishedStatus={'published'}
							modelName={model.name}
						/> */}
						{props.rightButtons ? props.rightButtons : null}
						{props.canEdit &&
						props?.model?.name !== 'prd' &&
						props.mode !== 'viewing' ? (
							<Link
								to={
									(isExternal ? externalBaseURL : '') +
									model.editUrl(props.id, props.prdId ?? '')
								}
							>
								<Button variant="secondary">Edit</Button>
							</Link>
						) : null}

						{props.canDelete ? (
							<DeleteButton
								model={model}
								name={props.name}
								objId={props.id}
								prdId={props.prdId}
							/>
						) : null}
					</div>
				)
				break
			case 'edit':
				newTitle = `Edit ${model.displayNames.singular}`
				rightButtons = (
					<div className="flex gap-x-3">
						{/* {starable ? (
							<StarButton
								isStarred={!!props.isStarred}
								modelId={props.id}
								modelName={model.name}
							/>
						) : null} */}
						{props.canDelete ? (
							<DeleteButton model={model} name={props.name} />
						) : null}
					</div>
				)
				break
			case 'list':
				newTitle = `${model.displayNames.plural}`
				pageDescription = model.helpText
				rightButtons = <div className="flex gap-3">{props.rightButtons}</div>
				break
			case 'new':
				newTitle = `New ${model.displayNames.singular}`

				break
		}
	}

	const nonEditingItem = (
		<div className="flex">
			{'title' in props ? (
				<h1 className="mb-1 text-h4 line-clamp-2">{props.title}</h1>
			) : (
				newTitle !== '' && (
					<h1 className="mb-1 text-h4 line-clamp-2">{newTitle}</h1>
				)
			)}
			{'canEdit' in props && props.canEdit && (
				<Button
					className="ml-2"
					onClick={handleEditClick}
					size="icon"
					variant="ghost-muted"
				>
					<Icon name="pencil" />
				</Button>
			)}
		</div>
	)
	return (
		<div>
			{'type' in props &&
			props.type === 'details' &&
			props?.model?.name === 'prd' ? (
				<div className="flex w-full flex-wrap justify-between">
					{isEditing && 'canEdit' in props && props.canEdit ? (
						<fetcher.Form
							action="/resources/rename-item"
							className="flex -ml-2"
							method="POST"
						>
							<Input
								autoComplete="off"
								className="w-full"
								data-1p-ignore
								defaultValue={props.name}
								name="name"
								ref={inputRef}
								type="text"
							/>
							<input name="id" type="hidden" value={props.id} />
							<input name="objType" type="hidden" value={props?.model?.name} />
							<Button
								className="ml-2"
								onClick={(e) => {
									setIsEditing(false)
									fetcher.submit(e.currentTarget.form)
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
					{rightButtons}
				</div>
			) : (
				<div className="flex w-full flex-wrap justify-between">
					{'title' in props ? (
						<h1 className="mb-1 mr-2 text-h4 line-clamp-2">{props.title}</h1>
					) : (
						newTitle !== '' && (
							<h1 className="mb-1 mr-2 text-h4 line-clamp-2">{newTitle}</h1>
						)
					)}
					{rightButtons}
				</div>
			)}
			{pageDescription && (
				<p className="text-muted-foreground">{pageDescription}</p>
			)}
		</div>
	)
}
