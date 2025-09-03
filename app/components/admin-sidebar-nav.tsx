import { Link, useLocation } from 'react-router'
import { cn } from '#app/utils/misc'
import { buttonVariants } from './ui/button'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string
		title: string
	}[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const pathname = useLocation()

	return (
		<nav
			className={cn(
				'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
				className,
			)}
			{...props}
		>
			{items.map((item) => (
				<Link
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						pathname.pathname === item.href
							? 'bg-muted hover:bg-muted'
							: 'hover:bg-transparent hover:underline',
						'justify-start',
					)}
					key={item.href}
					to={item.href}
				>
					{item.title}
				</Link>
			))}
		</nav>
	)
}
