import { Suspense } from 'react'
import { Await, Form } from 'react-router'
import type { Grant } from '#app/routes/resources+/_grant'
import { formatDateRelative } from '#app/utils/date-utils'
import type { models } from '#app/utils/models'
import DescriptionText from './description-text'
import { Heading } from './heading'
import { Spacer } from './spacer'
import { Button } from './ui/button'
import { Card, CardTitle } from './ui/card'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'

interface Props<T extends keyof typeof models> {
	canDelete: boolean
	canEdit: boolean
	isExternal?: boolean
	model: (typeof models)[T]
	noBreadcrumbs?: boolean
	noHome?: boolean
	obj: {
		createdAt: Date
		description?: null | string
		id: string
		name: string
		starred?: boolean
		suggestedDescription?: null | Promise<null | string> | string
		updatedAt: Date
	}
	permissions: Grant[]
	prdId?: string
	rightButtons?: React.ReactNode
	showDescription?: boolean
	showTimestamps?: boolean
}

export function DetailsBase<T extends keyof typeof models>({
	canDelete,
	canEdit,
	isExternal,
	model,
	noBreadcrumbs,
	obj,
	permissions,
	prdId,
	rightButtons,
	showDescription = true,
	showTimestamps = true,
}: Props<T>) {
	return (
		<>
			<Heading
				canDelete={canDelete}
				canEdit={canEdit}
				id={obj.id}
				isExternal={isExternal}
				isStarred={obj.starred ?? false}
				model={model}
				name={obj.name}
				noBreadcrumbs={noBreadcrumbs}
				permissions={permissions}
				prdId={prdId}
				rightButtons={rightButtons}
				type="details"
			/>
			<Spacer size="4xs" />

			{showDescription ? (
				obj.description ? (
					<DescriptionText
						className="mt-4"
						maxLength={400}
						text={obj.description}
					/>
				) : (
					<SuggestedDescription
						id={obj.id}
						model={model}
						suggestedDescription={obj.suggestedDescription}
					/>
				)
			) : null}

			{showTimestamps ? (
				<>
					<p className="mt-2 text-sm text-muted-foreground">
						Created: {formatDateRelative(obj.createdAt)}
					</p>
					<p className="text-sm text-muted-foreground">
						Last updated: {formatDateRelative(obj.updatedAt)}
					</p>
				</>
			) : null}
		</>
	)
}

function SuggestedDescription({
	id,
	model,
	// prdId,
	suggestedDescription,
}: {
	id: string
	model: (typeof models)[keyof typeof models]
	// prdId: string
	suggestedDescription?: null | Promise<null | string> | string
}) {
	return (
		<Card className="p-4">
			<Suspense fallback={<Skeleton className="h-[200px] rounded-md" />}>
				<Await resolve={suggestedDescription}>
					{(description) => {
						return description ? (
							<>
								<CardTitle className="text-lg">Suggested Description</CardTitle>
								<Form
									action="/resources/accept-description"
									className="inline"
									method="POST"
									navigate={false}
								>
									<input name="id" type="hidden" value={id} />
									<input name="modelName" type="hidden" value={model.name} />
									<Button
										className="text-secondary-foreground"
										type="submit"
										variant="link"
									>
										<Icon name="check">Accept</Icon>
									</Button>
									{/* <Link to={model.editUrl(id, prdId)}>
										<Button
											className="text-secondary-foreground"
											type="submit"
											value="edit"
											variant="link"
										>
											<Icon name="pencil">Edit</Icon>
										</Button>
									</Link> */}
								</Form>
								<DescriptionText className="mt-2" text={description} />
							</>
						) : null
					}}
				</Await>
			</Suspense>
		</Card>
	)
}
