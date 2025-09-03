import type { VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { useSpinDelay } from 'spin-delay'
import { cn } from '#app/utils/misc'
import { Button, type buttonVariants } from './button'
import { Icon } from './icon'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip'

type StatusType = 'idle' | 'pending' | 'success' | 'error'

interface StatusButtonProps
	extends React.ComponentProps<'button'>,
		VariantProps<typeof buttonVariants> {
	children: React.ReactNode
	message?: string
	spinDelay?: { delay?: number; minDuration?: number }
	status: StatusType
	asChild?: boolean
}

export const StatusButton = ({
	children,
	className,
	message,
	spinDelay,
	status,
	...props
}: StatusButtonProps) => {
	const delayedPending = useSpinDelay(status === 'pending', {
		delay: 400,
		minDuration: 300,
		...spinDelay,
	})
	const companion = {
		error: (
			<div className="inline-flex size-6 items-center justify-center rounded-full bg-destructive">
				<Icon className="text-destructive-foreground" name="cross-1" />
			</div>
		),
		idle: null,
		pending: delayedPending ? (
			<div className="inline-flex size-6 items-center justify-center">
				<Icon className="animate-spin" name="update" />
			</div>
		) : null,
		success: (
			<div className="inline-flex size-6 items-center justify-center">
				<Icon name="check" />
			</div>
		),
	}[status]

	return (
		<Button className={cn('flex justify-center gap-4', className)} {...props}>
			<div>{children}</div>
			{message ? (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>{companion}</TooltipTrigger>
						<TooltipContent>{message}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				companion
			)}
		</Button>
	)
}
StatusButton.displayName = 'StatusButton'
