import type { Column } from '@tanstack/react-table'
import { cn } from '#app/utils/misc'
import { Button } from './button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './dropdown-menu'
import { Icon } from './icon'

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>
	title: string
}

export function DataTableColumnHeader<TData, TValue>({
	className,
	column,
	title,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>
	}

	return (
		<div className={cn('flex items-center space-x-2', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="-ml-3 h-8 data-[state=open]:bg-accent"
						size="sm"
						variant="ghost"
					>
						<span>{title}</span>
						{column.getIsSorted() === 'desc' ? (
							<Icon className="ml-2" name="arrow-down" size="md" />
						) : column.getIsSorted() === 'asc' ? (
							<Icon className="ml-2" name="arrow-up" size="md" />
						) : (
							<Icon className="ml-2" name="chevrons-up-down" size="md" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<Icon
							className="mr-2 size-3.5 text-muted-foreground/70"
							name="arrow-up"
						/>
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<Icon
							className="mr-2 size-3.5 text-muted-foreground/70"
							name="arrow-down"
						/>
						Desc
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<Icon
							className="mr-2 size-3.5 text-muted-foreground/70"
							name="eye-off"
						/>
						Hide
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
