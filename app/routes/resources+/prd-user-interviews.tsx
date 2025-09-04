import { type FieldMetadata, getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import React, { useState } from 'react'
import { Form, useActionData, useNavigate } from 'react-router'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { ComboConform } from '#app/components/inputs/combo-conform.js'
import { Button } from '#app/components/ui/button'
import { models } from '#app/utils/models'
import type {
	ExistingAndSuggestedClient,
	PrdObjProps,
} from '#app/utils/sort-objs'
import type { Route } from './+types/prd-personas'

const schema = z.object({
	prdId: z.string(),
})

const _model = models.prdPersona

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { prdId } = result.value

	return result.reply()
}

export function UserInterviewSection({
	prdId,
	userInterviews,
	prdUserInterviews,
	isEditor,
}: {
	prdId: string
	userInterviews: ExistingAndSuggestedClient[]
	prdUserInterviews: PrdObjProps[]
	isEditor: boolean
}) {
	// const acceptedItems = sortByAccepted(items.filter((item) => item.isAccepted))
	const [_inputValue, setInputValue] = useState('')

	const _buttonRef = React.useRef<HTMLButtonElement>(null)
	const navigate = useNavigate()
	const _handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// Call your submit function here v
		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/add-item',
			method: 'post',
			navigate: false,
		})
		setInputValue('')
	}

	const lastResult = useActionData<typeof action>()
	const submit = useDebounceSubmit()
	const [form, _fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'user-interviews-section',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},

		shouldRevalidate: 'onBlur',
	})

	const selectedIds = prdUserInterviews.map((item) => item.userInterviewId)

	return (
		<div>
			{isEditor ? (
				<>
					<div className="mb-2">
						Manage User Interviews for this PRD — add new or update existing
						interviews.
					</div>
					<div className="flex space-x-2 w-full max-w-xl">
						<ComboConform
							title="User Interviews"
							items={userInterviews.sort((a, b) =>
								a.isAccepted === b.isAccepted ? 0 : a.isAccepted ? -1 : 1,
							)}
							meta={
								{
									initialValue: selectedIds,
								} as FieldMetadata<string[]>
							}
							onBlur={(selectedIds: string | string[] | undefined) => {
								const formData = new FormData()
								formData.append(
									'selectedUserInterviewIds',
									JSON.stringify(selectedIds ?? []),
								)
								formData.append('objType', 'prdUserInterview')
								formData.append('prdId', prdId)
								formData.append('action', 'sync')

								submit(formData, {
									action: '/resources/modify-suggestion',
									method: 'post',
									navigate: false,
								})
							}}
						/>
						<Button
							className="ml-2 h-11 px-5"
							onClick={() => {
								navigate(`/userinterviews/new?prdId=${prdId}`)
							}}
							variant="outline"
						>
							Add
						</Button>
					</div>
				</>
			) : (
				<ul className="list-disc list-inside mt-2">
					{selectedIds.length === 0 ? (
						<p className="text-muted-foreground italic mb-4">
							No user interviews found.
						</p>
					) : (
						userInterviews
							.filter((item) =>
								prdUserInterviews.find((i) => item.id === i.userInterviewId),
							)
							.map((item) => <li key={item.id}>{item.name}</li>)
					)}
				</ul>
			)}

			{isEditor && (
				<Form
					method="POST"
					{...getFormProps(form)}
					action="/resources/prd-personas"
					onBlur={(event) => {
						submit(event.currentTarget, {
							debounceTimeout: 0,
							navigate: false,
						})
					}}
				>
					<input name="prdId" type="hidden" value={prdId} />
				</Form>
			)}
		</div>
	)
}
