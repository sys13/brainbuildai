import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { format } from 'date-fns'
import * as React from 'react'
import { Button } from '#app/components/ui/button'
import { Calendar } from '#app/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover'
import { cn } from '#app/utils/misc'
import { Icon } from '../ui/icon'

export function DatePickerConform({ meta }: { meta: FieldMetadata<Date> }) {
	const triggerRef = React.useRef<HTMLButtonElement>(null)
	const control = useControl(meta)

	return (
		<div>
			<input
				aria-hidden
				className="sr-only"
				defaultValue={
					meta.initialValue ? new Date(meta.initialValue).toISOString() : ''
				}
				name={meta.name}
				onFocus={() => {
					triggerRef.current?.focus()
				}}
				ref={control.register}
				tabIndex={-1}
			/>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							'w-64 justify-start text-left font-normal focus:ring-2 focus:ring-stone-950 focus:ring-offset-2',
							!control.value && 'text-muted-foreground',
						)}
						ref={triggerRef}
						variant={'outline'}
					>
						<Icon className="mr-2 size-4" name="calendar" />
						{control.value ? (
							format(control.value, 'PPP')
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						initialFocus
						mode="single"
						onSelect={(value) => control.change(value?.toISOString() ?? '')}
						selected={new Date(control.value ?? '')}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
