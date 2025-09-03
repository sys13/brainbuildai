import {
	unstable_Control as Control,
	type FieldMetadata,
} from '@conform-to/react'
import { Checkbox } from '#app/components/ui/checkbox'

export function CheckboxGroupConform({
	items,
	meta,
}: {
	items: { name: string; value: string }[]
	meta: FieldMetadata<string[]>
}) {
	const initialValue =
		typeof meta.initialValue === 'string'
			? [meta.initialValue]
			: (meta.initialValue ?? [])

	return (
		<>
			{items.map((item) => (
				<Control
					key={item.value}
					meta={{
						initialValue: initialValue.find((v) => v === item.value)
							? [item.value]
							: '',
						key: meta.key,
					}}
					render={(control) => (
						<div
							className="flex items-center gap-2"
							ref={(element) => {
								control.register(element?.querySelector('input'))
							}}
						>
							<Checkbox
								checked={control.value === item.value}
								className="focus:ring-stone-950 focus:ring-2 focus:ring-offset-2"
								id={`${meta.name}-${item.value}`}
								name={meta.name}
								onBlur={control.blur}
								onCheckedChange={(value) =>
									control.change(value.valueOf() ? item.value : '')
								}
								type="button"
								value={item.value}
							/>
							<label htmlFor={`${meta.name}-${item.value}`}>{item.name}</label>
						</div>
					)}
				/>
			))}
		</>
	)
}
