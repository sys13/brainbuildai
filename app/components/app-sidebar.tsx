import { NavUser } from '#app/components/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '#app/components/ui/sidebar'
import { createAvatarName } from '#app/utils/avatar-name'
import type { ModelName } from '#app/utils/modelNames'
import { models } from '#app/utils/models'
import type { Theme } from '#app/utils/theme.server'
import { useUser } from '#app/utils/user'
import type * as React from 'react'
import { useLocation } from 'react-router'
import { NavItems } from './nav-items'
import type { IconName } from './ui/icon'

const internalModels: ModelName[] = [
	'prd',
	'persona',
	'product',
	'userInterview',
]
interface NavItem {
	icon: IconName
	inProject: boolean
	isActive: boolean
	name: string
	url: string
}

export function internalNavItems(prdId: string): NavItem[] {
	const location = useLocation()

	const items = internalModels.map((modelName) => {
		const model = models[modelName]
		const url = model.inProject ? model.listUrl(prdId) : model.listUrl()
		return {
			icon: ('icon' in model ? model.icon : 'check') as IconName,
			inProject: true,
			isActive:
				location.pathname.toLowerCase() === url.toLowerCase() ||
				location.pathname.toLowerCase().startsWith(url.toLowerCase()),
			name: model.displayNames.plural,
			url,
		}
	})

	return items
}

function _CodeItem({ prdId }: { prdId: string }): NavItem {
	const location = useLocation()
	const url = `/prds/${prdId}/code`
	return {
		icon: 'code',
		inProject: false,
		isActive: location.pathname === url || location.pathname.startsWith(url),
		name: 'Code',
		url,
	}
}

const secondaryData: {
	icon: IconName
	name: string
	primary?: boolean
	url: string
}[] = [
	{ icon: 'message-square-text', name: 'Feedback', url: '/contact' },
	{ icon: 'star', name: 'Upgrade to Pro', primary: true, url: '/pricing' },
]

export function AppSidebar({
	theme,
	...props
}: React.ComponentProps<typeof Sidebar> & { theme: null | Theme }) {
	const user = useUser()
	// const { prd } = usePRDData() ?? { prd: null }
	const location = useLocation()
	const dashboardItem = {
		icon: 'home' as IconName,
		name: 'Dashboard',
		url: '/dashboard',
		isActive:
			location.pathname.toLowerCase() === '/dashboard'.toLowerCase() ||
			location.pathname.toLowerCase().startsWith('/dashboard'.toLowerCase()),
	}
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild size="lg">
							{/* biome-ignore lint/a11y/useValidAnchor: will remove */}
							<a href="#">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
									<img
										alt="BrainBuildAI"
										className="size-6"
										src="/favicon.svg"
									/>
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">BrainBuildAI</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{
					<>
						<NavItems items={[dashboardItem, ...internalNavItems('')]} />
						<NavItems className="mt-auto" items={secondaryData} />
					</>
				}
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					theme={theme}
					user={{ ...user, avatar: createAvatarName(user.name ?? '') }}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
