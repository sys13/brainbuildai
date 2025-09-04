import { Link } from 'react-router'
import { cn, type Item } from '#app/utils/misc'
import ButtonLink from './link-button'
import type { NavItem } from './sidebar-items-data'
import { Icon } from './ui/icon'
import { Separator } from './ui/separator'

export function SidebarItems({
	navItems,
	prd,
	tier,
}: {
	allProjects: Item[]
	navItems: NavItem[]
	prd?: Item | null
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
	tier?: string
}) {
	return (
		<ul className="-mx-2 space-y-1">
			{navItems
				.filter(
					(item) => !(prd === null && (item.inPRD || item.name === 'sep')),
				)
				.map((item) =>
					item.href ? (
						<li key={item.name}>
							<Link
								className={cn(
									item.current
										? 'bg-accent text-foreground'
										: 'text-foreground hover:bg-accent',
									'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
								)}
								to={item.href}
							>
								{item.icon && (
									<Icon
										aria-hidden="true"
										className=" size-6 shrink-0"
										name={item.icon}
									/>
								)}
								{item.name ? item.name : ''}
							</Link>
						</li>
					) : item.count ? (
						<div className="m-2 mt-6 py-3 pb-4" key={item.count}>
							<Icon name="wand-2" />
							<span className="ml-3 py-6 text-sm leading-6 text-pretty">
								{item.count}/100 AI requests
							</span>
						</div>
					) : (
						<div key="sep">
							{(tier === undefined ||
								!['enterprise', 'pro'].includes(tier)) && (
								<>
									<Separator />
									<div className="mt-2">
										<span className="mr-2 font-semibold">Pro Features</span>
										<ButtonLink to="/pricing" variant="outline">
											Upgrade
										</ButtonLink>
									</div>
								</>
							)}
						</div>
					),
				)}
		</ul>
	)
}
