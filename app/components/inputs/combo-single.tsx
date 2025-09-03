import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import * as React from 'react'
import { type Item, cn } from '#app/utils/misc'
import { Button } from '../ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command'
import { Icon } from '../ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import type { SelectTrigger } from '../ui/select'

export function ComboboxSingle({
	items,
	meta,
	title,
}: {
	items: Item[]
	meta: FieldMetadata<null | string>
	title: string
}) {
	const [open, setOpen] = React.useState(false)
	// const [value, setValue] = React.useState('')
	const selectRef = React.useRef<React.ElementRef<typeof SelectTrigger>>(null)
	const control = useControl(meta)

	return (
		<fieldset>
			<select
				aria-hidden
				className="sr-only"
				defaultValue={meta.initialValue}
				form={meta.formId}
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
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						aria-expanded={open}
						className="w-[200px] justify-between"
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="combobox"
						variant="outline"
					>
						{control.value
							? items.find((item) => item.id === control.value)?.name
							: title}
						{/* {value ? items.find((item) => item.id === value)?.name : title} */}
						<Icon className="opacity-50" name="chevrons-up-down" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandInput placeholder={title} />
						<CommandList>
							<CommandEmpty>No items found</CommandEmpty>
							<CommandGroup>
								{items.map((item) => (
									<CommandItem
										key={item.id}
										onSelect={(currentValue) => {
											control.change(currentValue)
											// setValue(currentValue === value ? '' : currentValue)
											setOpen(false)
										}}
										value={item.id}
									>
										{item.name}
										<Icon
											className={cn(
												'ml-auto',
												control.value === item.id ? 'opacity-100' : 'opacity-0',
												// value === item.id ? 'opacity-100' : 'opacity-0',
											)}
											name="check"
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</fieldset>
	)
}
