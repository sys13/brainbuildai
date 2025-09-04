import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { type ComponentProps, type ElementRef, useRef } from 'react'
import { useSearchParams } from 'react-router'
import type { Select, SelectTrigger } from '#app/components/ui/select'
import { cn, type Item } from '#app/utils/misc'
import { compact } from '#app/utils/ts-utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '../ui/command'
import { Icon } from '../ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'

export const ComboConform = ({
	doQueryParams,
	items,
	meta,
	title,
	onBlur,
	// ...props
}: ComponentProps<typeof Select> & {
	doQueryParams?: boolean
	items: Item[]
	meta: FieldMetadata<string[]>
	title: string
	onBlur?: (selectedList: string | string[] | undefined) => void
}) => {
	const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null)
	const control = useControl(meta)
	const [, setSearchParams] = useSearchParams()

	return (
		<>
			<select
				aria-hidden
				className="sr-only"
				defaultValue={
					Array.isArray(meta.initialValue)
						? compact(meta.initialValue)
						: meta.initialValue
				}
				form={meta.formId}
				multiple
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

			<Popover onOpenChange={(e) => !e && onBlur?.(control.value)}>
				<PopoverTrigger asChild>
					<Button
						className="h-11 w-full justify-start overflow-auto"
						size="sm"
						variant="outline"
					>
						<Icon className="mr-2 size-4" name="plus">
							{title}
						</Icon>

						{control.value !== undefined &&
							control.value !== '' &&
							(Array.isArray(control.value)
								? control.value.length > 0
								: true) && (
								<>
									<Separator className="mx-2 h-4" orientation="vertical" />
									<Badge
										className="rounded-sm px-1 font-normal lg:hidden"
										variant="secondary"
									>
										{control.value.length}
									</Badge>
									<div className="hidden space-x-1 lg:flex">
										{Array.isArray(control.value) &&
										control.value.length > 5 ? (
											<Badge
												className="rounded-sm px-1 font-normal"
												variant="secondary"
											>
												{control.value.length} selected
											</Badge>
										) : (
											items
												.filter((option) => control.value?.includes(option.id))
												.map((option) => (
													<Badge
														className="rounded-sm px-1 font-normal"
														key={option.id}
														variant="secondary"
													>
														{option.name}
													</Badge>
												))
										)}
									</div>
								</>
							)}
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-[200px] p-0">
					<Command>
						<CommandInput placeholder={title} />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup>
								{items.map((item) => {
									const isSelected = control.value?.includes(item.id)
									return (
										<CommandItem
											key={item.id}
											onSelect={() => {
												if (isSelected) {
													if (Array.isArray(control.value)) {
														const newValues = control.value.filter(
															(value) => value !== item.id,
														)

														control.change(newValues)
														if (doQueryParams) {
															setSearchParams(
																(prev) => {
																	prev.delete(meta.name)
																	for (const value of newValues) {
																		prev.append(meta.name, value)
																	}
																	return prev
																},
																{ preventScrollReset: true },
															)
														}
													} else {
														control.change([])
													}
												} else {
													if (Array.isArray(control.value)) {
														const newValues = [...control.value, item.id]
														control.change(newValues)
														if (doQueryParams) {
															setSearchParams(
																(prev) => {
																	prev.delete(meta.name)
																	for (const value of newValues) {
																		prev.append(meta.name, value)
																	}
																	return prev
																},
																{ preventScrollReset: true },
															)
														}
													} else {
														control.change([item.id])
														setSearchParams(
															(prev) => {
																prev.set(meta.name, item.id)
																return prev
															},
															{ preventScrollReset: true },
														)
													}
												}
											}}
										>
											<div
												className={cn(
													'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
													isSelected
														? 'bg-primary text-primary-foreground'
														: 'opacity-50 [&_svg]:invisible',
												)}
											>
												<Icon name="check" />
											</div>
											{/* {item.icon && (
												<option.icon className="mr-2 size-4 text-muted-foreground" />
											)} */}
											<span>{item.name}</span>
											{/* {facets?.get(option.value) && (
											<span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)} */}
										</CommandItem>
									)
								})}
							</CommandGroup>
							{control.value !== undefined &&
								control.value !== '' &&
								(Array.isArray(control.value)
									? control.value.length > 0
									: true) && (
									<>
										<CommandSeparator />
										<CommandGroup>
											<CommandItem
												className="justify-center text-center"
												onSelect={() => {
													control.change('')
													// setSelectedValues(new Set())
												}}
											>
												Clear filters
											</CommandItem>
										</CommandGroup>
									</>
								)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</>
	)
}
