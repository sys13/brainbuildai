import { Link } from 'react-router'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '#app/components/ui/sidebar'
import { cn } from '#app/utils/misc'
import { Icon, type IconName } from './ui/icon'

export function NavItems({
	items,
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
	items: {
		icon: IconName
		isActive?: boolean
		name: string
		primary?: boolean
		url: string
	}[]
}) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton asChild isActive={item.isActive}>
								<Link to={item.url}>
									<Icon
										className={cn(item.primary && 'text-primary')}
										name={item.icon}
									/>
									<span>{item.name}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
