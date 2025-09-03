import { type FieldMetadata, getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import React, { useState } from 'react'
import { Form, useActionData } from 'react-router'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { ComboConform } from '#app/components/inputs/combo-conform.js'
import type { PrdPersonaProps } from '#app/components/prd/prd-section'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon.js'
import { Input } from '#app/components/ui/input'
import { requireInternalUser } from '#app/utils/auth.server'
import { models } from '#app/utils/models'
import type { ExistingAndSuggestedClient } from '#app/utils/sort-objs'
import type { Route } from './+types/prd-personas'

const schema = z.object({
	prdId: z.string(),
})

const model = models.prdPersona

export async function action({ request }: Route.ActionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { prdId } = result.value

	return result.reply()
}

export function PersonasSection({
	prdId,
	personas,
	prdPersonas,
	isEditor,
}: {
	prdId: string
	personas: ExistingAndSuggestedClient[]
	prdPersonas: PrdPersonaProps[]
	isEditor: boolean
}) {
	const [inputValue, setInputValue] = useState('')
	const [showForm, setShowForm] = useState<boolean>(false)
	const [optimisticPersonas, setOptimisticPersonas] = useState<
		ExistingAndSuggestedClient[]
	>([])
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const buttonRef = React.useRef<HTMLButtonElement>(null)
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/add-item',
			method: 'post',
			navigate: false,
		})
		const tempId = `temp-${Date.now()}`
		const optimisticPersona: ExistingAndSuggestedClient = {
			id: tempId,
			name: inputValue,
			isAccepted: true,
			isAddedManually: true,
			isSuggested: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		setOptimisticPersonas((prev) => [...prev, optimisticPersona])
		setInputValue('')
	}
	React.useEffect(() => {
		if (personas) setOptimisticPersonas([])
	}, [personas])
	const lastResult = useActionData<typeof action>()
	const submit = useDebounceSubmit()
	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'personas-section',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},

		shouldRevalidate: 'onBlur',
	})
	const handleChangePersonas = (selectedIds: string | string[] | undefined) => {
		const formData = new FormData()
		formData.append('selectedPersonaIds', JSON.stringify(selectedIds ?? []))
		formData.append('objType', 'prdPersona')
		formData.append('action', 'sync')
		formData.append('prdId', prdId)

		submit(formData, {
			action: '/resources/modify-suggestion',
			method: 'post',
			flushSync: true,
			navigate: false,
		})
	}
	const prdPersonasIds: string[] = prdPersonas.map(
		(item: PrdPersonaProps) => item.personaId,
	)

	const acceptedFromDB = personas.filter((p) => prdPersonasIds.includes(p.id))

	const acceptedPersonas = [...acceptedFromDB, ...optimisticPersonas]
	return (
		<div>
			{!isEditor && acceptedPersonas.length === 0 && (
				<p className="text-muted-foreground italic mb-4">
					No personas added yet.
				</p>
			)}
			{!isEditor && (
				<ul className="list-disc list-inside">
					{acceptedPersonas.map((p) => (
						<li key={p.id}>{p.name}</li>
					))}
				</ul>
			)}
			{isEditor && (
				<>
					<div className="flex space-x-2 w-full max-w-xl space-y-2">
						<ComboConform
							title="Select Personas"
							items={personas.sort((a, b) =>
								prdPersonasIds.includes(a.id) === prdPersonasIds.includes(b.id)
									? 0
									: prdPersonasIds.includes(a.id)
										? -1
										: 1,
							)}
							meta={
								{
									initialValue: prdPersonasIds,
								} as FieldMetadata<string[]>
							}
							onBlur={handleChangePersonas}
						/>
						<Button
							className="ml-2 h-11 px-5"
							onClick={() => setShowForm(!showForm)}
							variant="outline"
						>
							{showForm ? (
								'Hide'
							) : (
								<>
									<Icon className="mr-1 size-4" name="plus" />
									New
								</>
							)}
						</Button>
					</div>

					{showForm && (
						<>
							<div className="my-2">Or add a new persona</div>
							<form className="mb-2" onSubmit={handleSubmit}>
								<input name="objType" type="hidden" value="prdPersona" />
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
									<Button
										className="ml-2 h-11 px-5"
										type="submit"
										variant="outline"
									>
										Add
									</Button>
								</div>
							</form>
						</>
					)}

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
				</>
			)}
		</div>
	)
}
