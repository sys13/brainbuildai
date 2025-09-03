import { Link, useSubmit } from 'react-router'
import { Avatar, AvatarFallback } from '#app/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '#app/components/ui/sidebar'
import { ThemeSwitch } from '#app/routes/resources+/theme-switch'
import { createAvatarName } from '#app/utils/avatar-name'
import type { Theme } from '#app/utils/theme.server'
import { Icon } from './ui/icon'

export function NavUser({
	theme,
	user,
}: {
	theme: null | Theme
	user: {
		avatar: string
		email: string
		name: null | string
	}
}) {
	const { isMobile, toggleSidebar } = useSidebar()
	const avatarName = createAvatarName(user.name ?? '')
	const submit = useSubmit()
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							size="lg"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								{/* <AvatarImage alt={user.name ?? ''} src={user.avatar} /> */}
								<AvatarFallback className="rounded-lg">
									{avatarName}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<Icon className="ml-auto size-4" name="chevrons-up-down" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{/* <AvatarImage alt={avatarName} src={user.avatar} /> */}
									<AvatarFallback className="rounded-lg">
										{avatarName}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => {
									if (isMobile) {
										toggleSidebar()
									}
								}}
							>
								<Link to="/pricing">
									<Icon className="mr-1 text-primary" name="star">
										Upgrade to Pro
									</Icon>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<ThemeSwitch sidebar userPreference={theme} />
						<DropdownMenuGroup>
							<Link to="/settings">
								<DropdownMenuItem
									onClick={() => {
										if (isMobile) {
											toggleSidebar()
										}
									}}
								>
									<Icon className="mr-1" name="users">
										Settings
									</Icon>
								</DropdownMenuItem>
							</Link>
							<Link to="/contact">
								<DropdownMenuItem
									onClick={() => {
										if (isMobile) {
											toggleSidebar()
										}
									}}
								>
									<Icon className="mr-1" name="envelope-closed">
										Contact Us
									</Icon>
								</DropdownMenuItem>
							</Link>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								const formData = new FormData()
								submit(formData, {
									action: '/logout',
									method: 'POST',
								})
							}}
						>
							<Icon className="mr-1" name="log-out">
								Log out
							</Icon>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
