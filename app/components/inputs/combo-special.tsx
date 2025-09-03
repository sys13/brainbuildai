import type * as React from 'react'
import { useSearchParams } from 'react-router'
import { cn } from '#app/utils/misc'
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

export type ComboFilterProps = {
	items: {
		icon?: React.ComponentType<{ className?: string }>
		id: string
		name: string
	}[]
	selectedValues: Set<string>
	setSelectedValues: React.Dispatch<React.SetStateAction<Set<string>>>
	title: string
} & (
	| {
			doQueryParams: true
			name: string
	  }
	| { doQueryParams: undefined }
)

export function ComboSpecial({
	doQueryParams,
	items,
	selectedValues,
	setSelectedValues,
	title,
	...rest
}: ComboFilterProps) {
	// const facets = column?.getFacetedUniqueValues()

	const [, setSearchParams] = useSearchParams()
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="h-8 border-dashed" size="sm" variant="outline">
					<Icon className="mr-2 size-4" name="plus">
						{title}
					</Icon>

					{selectedValues.size > 0 && (
						<>
							<Separator className="mx-2 h-4" orientation="vertical" />
							<Badge
								className="rounded-sm px-1 font-normal lg:hidden"
								variant="secondary"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge
										className="rounded-sm px-1 font-normal"
										variant="secondary"
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									items
										.filter((item) => selectedValues.has(item.id))
										.map((item) => (
											<Badge
												className="rounded-sm px-1 font-normal"
												key={item.id}
												variant="secondary"
											>
												{item.name}
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
								const isSelected = selectedValues.has(item.id)
								return (
									<CommandItem
										key={item.id}
										onSelect={() => {
											setSelectedValues((existingItems: Set<string>) => {
												const newValues = isSelected
													? new Set(
															[...existingItems].filter(
																(value) => value !== item.id,
															),
														)
													: new Set([item.id, ...existingItems])

												if (doQueryParams && 'name' in rest) {
													setSearchParams(
														(prev) => {
															prev.set(
																rest.name,
																Array.from(newValues).join(','),
															)
															return prev
														},
														{ preventScrollReset: true },
													)
												}
												return newValues
											})
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
										{item.icon && (
											<item.icon className="mr-2 size-4 text-muted-foreground" />
										)}
										<span>{item.name}</span>
										{/* {facets?.get(item.id) && (
											<span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
												{facets.get(item.id)}
											</span>
										)} */}
									</CommandItem>
								)
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										className="justify-center text-center"
										onSelect={() => {
											if (doQueryParams && 'name' in rest) {
												setSearchParams(
													(prev) => {
														prev.delete(rest.name)
														return prev
													},
													{ preventScrollReset: true },
												)
											}
											setSelectedValues(new Set())
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
	)
}
