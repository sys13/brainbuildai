import type * as React from 'react'
import { useSearchParams } from 'react-router'
import { cn } from '#app/utils/misc'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from './ui/command'
import { Icon } from './ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'

export type SelectFilterProps = {
	options: {
		icon?: React.ComponentType<{ className?: string }>
		label: string
		value: string
	}[]
	selectedValue: string
	setSelectedValue: React.Dispatch<React.SetStateAction<string>>
	title: string
} & (
	| {
			doQueryParams: true
			name: string
	  }
	| { doQueryParams: undefined }
)

export function SelectFilter({
	doQueryParams,
	options,
	selectedValue,
	setSelectedValue,
	title,
	...rest
}: SelectFilterProps) {
	// const facets = column?.getFacetedUniqueValues()

	const [, setSearchParams] = useSearchParams()
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="h-8 border-dashed" size="sm" variant="outline">
					<Icon className="mr-2 size-4" name="plus">
						{title}
					</Icon>

					{selectedValue !== '' && (
						<>
							<Separator className="mx-2 h-4" orientation="vertical" />
							<Badge
								className="rounded-sm px-1 font-normal lg:hidden"
								variant="secondary"
							>
								{
									options.find((option) => selectedValue === option.value)
										?.label
								}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{options
									.filter((option) => selectedValue === option.value)
									.map((option) => (
										<Badge
											className="rounded-sm px-1 font-normal"
											key={option.value}
											variant="secondary"
										>
											{option.label}
										</Badge>
									))}
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
							{options.map((option) => {
								const isSelected = selectedValue === option.value
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											setSelectedValue(() => {
												const newValue = isSelected ? '' : option.value

												if (doQueryParams && 'name' in rest) {
													setSearchParams(
														(prev) => {
															prev.set(rest.name, newValue)
															return prev
														},
														{ preventScrollReset: true },
													)
												}
												return newValue
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
										{option.icon && (
											<option.icon className="mr-2 size-4 text-muted-foreground" />
										)}
										<span>{option.label}</span>
										{/* {facets?.get(option.value) && (
											<span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)} */}
									</CommandItem>
								)
							})}
						</CommandGroup>
						{selectedValue !== '' && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										className="justify-center text-center"
										onSelect={() => {
											setSelectedValue(() => {
												if (doQueryParams && 'name' in rest) {
													setSearchParams(
														(prev) => {
															prev.delete(rest.name)
															return prev
														},
														{ preventScrollReset: true },
													)
												}
												return ''
											})
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
