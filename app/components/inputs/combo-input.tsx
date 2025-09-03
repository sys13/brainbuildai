import type { Item } from '#app/utils/misc'
import {
	type ManyToManyRelations,
	getMTMRelations,
} from '#app/utils/modelUtils'
import { models } from '#app/utils/models'
import { ComboConform } from './combo-conform'

export function ComboInput<T extends keyof typeof models>({
	className,
	formId,
	modelName,
	parentModelName,
	relations,
	searchParams,
}: {
	className?: string
	formId: string
	modelName: T
	parentModelName: keyof typeof models
	relations: Partial<
		Record<
			T,
			{
				all: Item[]
			}
		>
	>
	searchParams: URLSearchParams
}) {
	const model = models[modelName]
	type Model = (typeof models)[T]

	if (relations[modelName] === undefined) {
		return null
	}

	const manyToManyKeys = getMTMRelations(
		model,
	) as unknown as ManyToManyRelations<Model>[]

	// @ts-expect-error: modelName is a key of models
	const fieldId = manyToManyKeys.includes(parentModelName)
		? (`${modelName}Ids` as const)
		: (`${modelName}Id` as const)

	return (
		<div className={className}>
			<ComboConform
				doQueryParams
				items={relations[modelName].all}
				// @ts-expect-error: modelName is a key of models
				meta={{
					descriptionId: '',
					dirty: false,
					errorId: '',
					formId,
					id: '',
					initialValue: searchParams.getAll(fieldId),
					key: '',
					name: fieldId,
					valid: true,
				}}
				title={model.displayNames.plural}
			/>
		</div>
	)
}
