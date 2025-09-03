import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { type ElementRef, useRef } from 'react'
import { RadioGroup, RadioGroupItem } from '#app/components/ui/radio-group'

export function RadioGroupConform({
	items,
	meta,
}: {
	items: { label: string; value: string }[]
	meta: FieldMetadata<string>
}) {
	const radioGroupRef = useRef<ElementRef<typeof RadioGroup>>(null)
	const control = useControl(meta)

	return (
		<>
			<input
				className="sr-only"
				defaultValue={meta.initialValue}
				name={meta.name}
				onFocus={() => {
					radioGroupRef.current?.focus()
				}}
				ref={control.register}
				tabIndex={-1}
			/>
			<RadioGroup
				className="flex items-center gap-4"
				onBlur={control.blur}
				onValueChange={control.change}
				ref={radioGroupRef}
				value={control.value ?? ''}
			>
				{items.map((item) => {
					return (
						<div className="flex items-center gap-2" key={item.value}>
							<RadioGroupItem
								id={`${meta.id}-${item.value}`}
								value={item.value}
							/>
							<label htmlFor={`${meta.id}-${item.value}`}>{item.label}</label>
						</div>
					)
				})}
			</RadioGroup>
		</>
	)
}
