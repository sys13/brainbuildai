import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useActionData, useFetcher } from 'react-router'
import { FormField } from '#app/components/form-fields-builder'
import { FormSubmitButton } from '#app/components/form-submit-button'
import type { EditorProps } from '#app/routes/resources+/editor-utils'
import { models } from '#app/utils/models'
import {
	getHasOneRelations,
	getMTMRelations,
	type HasOneRelations,
	type ManyToManyRelations,
} from '#app/utils/modelUtils'
import type { action } from './__editor.server'

export const model = models.role
export const schema = model.schema

export const hasOneKeys = getHasOneRelations(
	model,
) as unknown as HasOneRelations<typeof model>[]
export const manyToManyKeys = getMTMRelations(
	model,
) as unknown as ManyToManyRelations<typeof model>[]
// export const relationKeys = Object.keys(
// 	model.relations,
// ) as (keyof typeof model.relations)[]

export type Props = EditorProps<typeof model>

export function Editor({ obj }: Props) {
	const fetcher = useFetcher<typeof action>()
	const lastResult = useActionData<typeof action>()
	const isPending = fetcher.state !== 'idle'

	// const manyToManyRelationDefaults = manyToManyKeys.reduce(
	// 	(acc, key) => {
	// 		const idsKey = `${key}Ids` as const
	// 		acc[idsKey] =
	// 			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	// 			(relations[key].existing as Item[])?.map((f) => f.id) ??
	// 			defaultValues?.[key]
	// 		return acc
	// 	},
	// 	{} as Record<`${(typeof relationKeys)[number]}Ids`, string[] | undefined>,
	// )

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		defaultValue: {
			description: obj?.description ?? '',
			name: obj?.name,
			// ...manyToManyRelationDefaults,
		},
		id: `${model.name}-editor`,
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})

	return (
		<div>
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				autoComplete="off"
				className="h-full pb-28 pt-6"
			>
				{obj ? <input name="id" type="hidden" value={obj.id} /> : null}

				<FormField autoFocus field={fields.name} inputType="input" />
				<FormField field={fields.description} inputType="textarea" />

				<FormSubmitButton formId={form.id} isPending={isPending} />
			</fetcher.Form>
		</div>
	)
}
