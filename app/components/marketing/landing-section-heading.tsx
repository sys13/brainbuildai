import { cn } from '#app/utils/misc'

export function LandingSectionHeading({
	className,
	text,
}: {
	className?: string
	sub: string
	text: string
}) {
	return (
		<div className={cn('w-full md:text-center md:ml-0', className)}>
			<h2 className="font-display text-3xl tracking-tight text-secondary-foreground sm:text-4xl text-center">
				{text}
			</h2>
		</div>
	)
}
