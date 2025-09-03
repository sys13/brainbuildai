import { useEffect, useRef, useState } from 'react'
import { Button } from '#app/components/ui/button.js'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Icon } from '../ui/icon'

export enum ModeType {
	editing = 'editing',
	viewing = 'viewing',
}

export function PrdModeSection({
	prdId,
	mode,
	setMode,
	isEditor,
}: {
	prdId: string
	mode: ModeType
	setMode: (mode: ModeType) => void
	isEditor: boolean
}) {
	const linkRef = useRef<HTMLInputElement>(null)
	const [link, setLink] = useState<string>('editing')

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setLink(window.location.href)
		}
	}, [])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" className="flex gap-2 items-center">
					{mode === ModeType.editing ? (
						<>
							<Icon name="pencil" size="font" />
							Editing
						</>
					) : (
						'Viewing'
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem
					onClick={() => setMode(ModeType.editing)}
					className={mode === ModeType.editing ? 'bg-muted' : ''}
				>
					<Icon name="pencil" size="font" />
					Editing
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setMode(ModeType.viewing)}
					className={mode === ModeType.viewing ? 'bg-muted' : ''}
				>
					{/* <Icon name="eye-off" size="sm" /> */}
					Viewing
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
