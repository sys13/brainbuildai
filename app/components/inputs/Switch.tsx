import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { type ElementRef, useRef } from 'react'
import { Switch } from '#app/components/ui/switch'

export function SwitchConform({ meta }: { meta: FieldMetadata<boolean> }) {
	const switchRef = useRef<ElementRef<typeof Switch>>(null)
	const control = useControl(meta)

	return (
		<>
			<input
				className="sr-only"
				defaultValue={meta.initialValue}
				name={meta.name}
				onFocus={() => {
					switchRef.current?.focus()
				}}
				ref={control.register}
				tabIndex={-1}
			/>
			<Switch
				checked={meta.value === 'on'}
				className="focus:ring-stone-950 focus:ring-2 focus:ring-offset-2"
				onBlur={control.blur}
				onCheckedChange={(checked) => {
					control.change(checked ? 'on' : '')
				}}
				ref={switchRef}
			/>
		</>
	)
}
