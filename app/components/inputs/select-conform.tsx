import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { type ComponentProps, type ElementRef, useRef } from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select'
import type { Item } from '#app/utils/misc'

export const SelectConform = ({
	items,
	meta,
	title,
	...props
}: ComponentProps<typeof Select> & {
	items: Item[]
	meta: FieldMetadata<string>
	title: string
}) => {
	const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null)
	const control = useControl(meta)

	return (
		<>
			<select
				aria-hidden
				className="sr-only"
				defaultValue={meta.initialValue ?? ''}
				name={meta.name}
				onFocus={() => {
					selectRef.current?.focus()
				}}
				ref={control.register}
				tabIndex={-1}
			>
				<option value="" />
				{items.map((option) => (
					<option key={option.id} value={option.id} />
				))}
			</select>
			<Select
				{...props}
				onOpenChange={(open) => {
					if (!open) {
						control.blur()
					}
				}}
				onValueChange={control.change}
				value={control.value ?? ''}
			>
				<SelectTrigger>
					<SelectValue placeholder={title} />
				</SelectTrigger>
				<SelectContent>
					{items.map((item) => {
						return (
							<SelectItem key={item.id} value={item.id}>
								{item.name}
							</SelectItem>
						)
					})}
				</SelectContent>
			</Select>
		</>
	)
}
