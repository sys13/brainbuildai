import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function ExportOptions({
	isLoading,
	onExport,
}: {
	isLoading?: boolean
	onExport: (type: 'pdf' | 'markdown' | 'json') => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" className="flex gap-2 items-center">
					{/* <DownloadIcon size={16} /> */}
					Export
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onClick={() => onExport('pdf')}>
					{isLoading ? 'Exporting PDF...' : 'Export PDF'}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onExport('markdown')}>
					{isLoading ? 'Exporting Markdown...' : 'Export Markdown'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
