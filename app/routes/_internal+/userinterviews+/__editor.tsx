import { type FieldMetadata, getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useActionData, useFetcher } from 'react-router'
import { FormField } from '#app/components/form-fields-builder'
import { FormSubmitButton } from '#app/components/form-submit-button'
import { ComboConform } from '#app/components/inputs/combo-conform'
import type { UserInterviewEditorProps } from '#app/routes/resources+/editor-utils'
import { models } from '#app/utils/models'
import type { action } from './__editor.server'
export const model = models.userInterview
export const schema = model.schema

export type Props = UserInterviewEditorProps<typeof model>

export function Editor({
	obj,
	data,
	prdId,
}: Omit<Props, 'relations'> & { prdId?: string[] }) {
	const fetcher = useFetcher<typeof action>()
	const lastResult = useActionData<typeof action>()
	const isPending = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: `${model.name}-editor`,
		lastResult,
		defaultValue: {
			name: obj?.name ?? '',
			customer: obj?.customer ?? '',
			description: obj?.description ?? '',
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})
	const initialPrdIds = prdId ?? []
	return (
		<div>
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				autoComplete="off"
				className="h-full pb-28 pt-6"
			>
				{/* {obj ? <input name="id" type="hidden" value={obj.id} /> : null} */}
				<div className="py-2">
					<ComboConform
						title="Prds"
						items={data}
						meta={{ initialValue: initialPrdIds } as FieldMetadata<string[]>}
						onBlur={(selectedIds: string | string[] | undefined) => {
							// Normalize selectedIds to always be an array
							const idsArray = selectedIds
								? Array.isArray(selectedIds)
									? selectedIds
									: [selectedIds]
								: []

							// Update the hidden input field value
							const hiddenInput = document.querySelector(
								'input[name="prdIds"]',
							) as HTMLInputElement | null

							if (hiddenInput) {
								hiddenInput.value = idsArray.join(',')
							} else {
								const input = document.createElement('input')
								input.type = 'hidden'
								input.name = 'prdIds'
								input.value = idsArray.join(',')
								document.forms[0].appendChild(input)
							}
						}}
						name="prdIds"
					/>
					<input
						type="hidden"
						name="prdIds"
						defaultValue={initialPrdIds.join(',')}
					/>
				</div>
				<FormField title="Company Name" field={fields.name} inputType="input" />
				<FormField
					title="Customer Name"
					field={fields.customer}
					inputType="input"
				/>

				<FormField
					title="Notes"
					field={fields.description}
					inputType="textarea"
				/>
				<FormSubmitButton formId={form.id} isPending={isPending} />
			</fetcher.Form>
		</div>
	)
}
