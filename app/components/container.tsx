import { cn } from '#app/utils/misc'

export function Container({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	return <div className={cn('mx-auto max-w-7xl px-4', className)} {...props} />
}
