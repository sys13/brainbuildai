import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import type { FormEventHandler } from 'react'
import { useFetcher } from 'react-router'
import { z } from 'zod'
// import { action } from '#app/routes/resources+/add-relation-item'
import type { Item } from '#app/utils/misc'
import type { models } from '#app/utils/models'
import { usePRDData } from '#app/utils/useProjectData'
import { ComboboxSingle } from './inputs/combo-single'
import { RelationsListViewItem } from './relations-list-view-item'

const MODEL_NAME = ['persona'] as const

export const ADD_RELATION_ITEM_SCHEMA = z.object({
	id: z.string(),
	mainModelId: z.string(),
	mainModelName: z.enum(MODEL_NAME),
	modelName: z.enum(MODEL_NAME),
})

interface Props {
	allObjs: Item[]
	mainModelId: string
	mainModelName: (typeof MODEL_NAME)[number]
	model: (typeof models)[(typeof MODEL_NAME)[number]]
	selectedObjs: Item[]
}

export function RelationsCombo({
	allObjs,
	mainModelId,
	mainModelName,
	model,
	selectedObjs,
}: Props) {
	const fetcher = useFetcher()
	// const fetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		constraint: getZodConstraint(ADD_RELATION_ITEM_SCHEMA),
		id: `relation-${mainModelName}-${model.name}`,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: ADD_RELATION_ITEM_SCHEMA,
			})
		},
	})

	const { prd } = usePRDData() ?? {}
	if (!prd) {
		return null
	}

	const handleChange: FormEventHandler<HTMLFormElement> = (event) => {
		fetcher.submit(event.currentTarget)
		form.reset()
	}

	return (
		<div>
			<h4 className="text-h6">{model.displayNames.plural}</h4>
			<fetcher.Form
				{...getFormProps(form)}
				action="/resources/add-relation-item"
				autoComplete="off"
				className="h-full pt-2 "
				method="post"
				onChange={handleChange}
			>
				<input name="modelName" type="hidden" value={model.name} />
				<input name="mainModelId" type="hidden" value={mainModelId} />
				<input name="mainModelName" type="hidden" value={mainModelName} />
				<ComboboxSingle
					items={allObjs.filter(
						(item) => !selectedObjs.some((obj) => obj.id === item.id),
					)}
					meta={fields.id}
					title={`Add a ${model.displayNames.lower}...`}
				/>
			</fetcher.Form>
			<ul className="list-disc list-inside mt-2">
				{selectedObjs.map((item) => (
					<RelationsListViewItem
						item={item}
						key={item.id}
						linkToDetails
						mainModelId={mainModelId}
						mainModelName={mainModelName}
						model={model}
						prdId={prd.id}
					/>
				))}
			</ul>
		</div>
	)
}
