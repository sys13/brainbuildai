import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Link, useLocation } from 'react-router'
import type { routeTypes } from '#app/root'
import { cn, type Item } from '#app/utils/misc'
import type { Theme } from '#app/utils/theme.server'
import { usePRDData } from '#app/utils/useProjectData'
import { useOptionalUser } from '#app/utils/user'
import { AppSidebar } from './app-sidebar'
import BreadcrumbsImpl from './breadcrumbs-impl'
import Footer from './footer'
import { NavBar } from './nav-bar'
import { Logo } from './nav-logo'
import { SidebarItems } from './sidebar-items'
import { internalNavItems, type NavItem, navItems } from './sidebar-items-data'
import { Icon } from './ui/icon'
import { Separator } from './ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarToggleButton,
} from './ui/sidebar'

export type RootUser = ReturnType<typeof useOptionalUser>

export function Layout({
	allProjects,
	children,
	routeType,
	theme,
	user,
	initialSidebarOpen,
}: {
	allProjects: Item[]
	children: React.ReactNode
	routeType: (typeof routeTypes)[number]
	theme: null | Theme
	user?: null | RootUser
	initialSidebarOpen?: boolean
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const location = useLocation()
	const { prd } = usePRDData() ?? {}
	let appNavItems: NavItem[]

	// always show the navbar
	// but only show pricing+contact us if on marketing site

	// if logged in, show the project switcher (or just show the user dropdown)

	// if screen is small enough, show the sidebar
	// if logged in and on internal page, show all the app stuff

	if (['auth', 'marketing', 'other'].includes(routeType)) {
		appNavItems = navItems.marketing
	} else if (routeType === 'internal') {
		appNavItems = internalNavItems(prd?.id ?? '')
	} else {
		appNavItems = navItems.marketing
	}

	const navItemsWithCurrent = appNavItems.map((item) => ({
		...item,
		current: item.href
			? item.href === '/'
				? location.pathname === item.href
				: location.pathname.startsWith(item.href)
			: false,
	}))

	const regex = /^\/projects\/[a-z0-9]+\/pages\/[a-z0-9]+$/
	const isPageEditor = regex.test(location.pathname)

	if (routeType === 'internal') {
		return (
			<SidebarProvider defaultOpen={initialSidebarOpen}>
				<AppSidebar theme={theme} />
				<SidebarInset>
					<div className="flex justify-center  h-full">
						<div className={cn('w-full', !isPageEditor && 'max-w-3xl ')}>
							<header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 mt-2">
								<div className="flex items-center gap-2 px-4">
									<SidebarToggleButton />
									<BreadcrumbsImpl />
								</div>
							</header>
							<div className="@container px-4">{children}</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	return (
		<div className="h-full ">
			{
				<>
					<NavBar
						isLoggedIn={!!user}
						routeType={routeType}
						setSidebarOpen={setSidebarOpen}
						theme={theme}
					/>
					<Transition as={Fragment} show={sidebarOpen}>
						<Dialog
							as="div"
							className="relative z-50 xl:hidden"
							onClose={setSidebarOpen}
						>
							<TransitionChild
								as={Fragment}
								enter="transition-opacity ease-linear duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="transition-opacity ease-linear duration-300"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="fixed inset-0 bg-black/10" />
							</TransitionChild>

							<div className="fixed inset-0 flex">
								<TransitionChild
									as={Fragment}
									enter="transition ease-in-out duration-300 transform"
									enterFrom="-translate-x-full"
									enterTo="translate-x-0"
									leave="transition ease-in-out duration-300 transform"
									leaveFrom="translate-x-0"
									leaveTo="-translate-x-full"
								>
									<DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 ">
										<TransitionChild
											as={Fragment}
											enter="ease-in-out duration-300"
											enterFrom="opacity-0"
											enterTo="opacity-100"
											leave="ease-in-out duration-300"
											leaveFrom="opacity-100"
											leaveTo="opacity-0"
										>
											<div className="absolute left-full top-0 flex w-16 justify-center pt-5">
												<button
													className="-m-2.5 p-2.5"
													onClick={() => setSidebarOpen(false)}
													type="button"
												>
													<span className="sr-only">Close sidebar</span>
													<Icon
														aria-hidden="true"
														className="text-primary"
														name="x"
														size="lg"
													/>
												</button>
											</div>
										</TransitionChild>
										{/* Sidebar component, swap this element with another sidebar if you like */}
										<MainArea
											allProjects={allProjects}
											navItems={navItemsWithCurrent}
											routeType={routeType}
											setSidebarOpen={setSidebarOpen}
											user={user}
										/>
									</DialogPanel>
								</TransitionChild>
							</div>
						</Dialog>
					</Transition>
				</>
			}

			<div className={cn('h-full p-4')}>
				<main className={cn('h-full')}>{children}</main>
				{
					<div className=" pt-8 sm:pt-24 lg:px-8 lg:pt-32">
						<Footer /> <Separator className="w-full" />
					</div>
				}
			</div>
		</div>
	)
}

function MainArea({
	allProjects,
	navItems,
	routeType,
	setSidebarOpen,
}: {
	allProjects: Item[]
	navItems: NavItem[]
	routeType?: 'internal' | string
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
	user?: null | RootUser
}) {
	const { prd } = usePRDData() ?? {}
	const user = useOptionalUser()
	return (
		<div
			className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-4 pt-4 ring-1 ring-white/10"
			onClick={() => {
				setSidebarOpen(false)
			}}
			onKeyUp={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					setSidebarOpen(false)
				}
			}}
		>
			<div className="-mt-0.5">
				<Link to={routeType === 'internal' ? '/dashboard' : '/'}>
					<Logo />
				</Link>
			</div>
			<nav className="flex flex-1 flex-col">
				<SidebarItems
					allProjects={allProjects}
					navItems={navItems}
					prd={prd}
					setSidebarOpen={setSidebarOpen}
					tier={user?.tenant.tier ?? ''}
				/>
			</nav>
		</div>
	)
}
