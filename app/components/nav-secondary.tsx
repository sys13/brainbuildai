import type * as React from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from './ui/icon'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from './ui/sidebar'

export function NavSecondary({
	items,
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
	items: {
		icon: IconName
		title: string
		url: string
	}[]
}) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild size="sm">
								<Link to={item.url}>
									<Icon name={item.icon} size="sm">
										{item.title}
									</Icon>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
