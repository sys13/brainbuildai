import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { type ElementRef, useRef } from 'react'
import { Checkbox } from '../ui/checkbox'

export function CheckboxConform({
	meta,
}: {
	meta: FieldMetadata<boolean | string | undefined>
}) {
	const checkboxRef = useRef<ElementRef<typeof Checkbox>>(null)
	const control = useControl(meta)

	return (
		<>
			<input
				aria-hidden
				className="sr-only"
				defaultValue={meta.initialValue}
				name={meta.name}
				onFocus={() => checkboxRef.current?.focus()}
				ref={control.register}
				tabIndex={-1}
			/>
			<Checkbox
				checked={control.value === 'on'}
				className="focus:ring-stone-950 focus:ring-2 focus:ring-offset-2"
				id={meta.id}
				onBlur={control.blur}
				onCheckedChange={(checked) => {
					control.change(checked ? 'on' : '')
				}}
				ref={checkboxRef}
			/>
		</>
	)
}
