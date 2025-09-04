import type React from 'react'
import { Link, useSubmit } from 'react-router'
import { twMerge } from 'tailwind-merge'
import type { routeTypes } from '#app/root'
import { ThemeSwitch } from '#app/routes/resources+/theme-switch'
import { cn } from '#app/utils/misc'
import type { Theme } from '#app/utils/theme.server'
import { Logo } from './nav-logo'
import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Icon } from './ui/icon'

const marketingNavItems = [
	{ href: '/pricing', icon: 'camera', name: 'Pricing' },
	{ href: '/contact', icon: 'envelope-closed', name: 'Contact' },
	{ href: '/blog', icon: 'newspaper', name: 'Blog' },
]

export function NavBar({
	isLoggedIn = false,
	routeType,
	setSidebarOpen,
	theme,
}: {
	isLoggedIn?: boolean
	routeType: (typeof routeTypes)[number]
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
	theme: null | Theme
}) {
	const submit = useSubmit()
	return (
		<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-background px-4 shadow-sm sm:px-6 lg:px-8">
			<button
				className={twMerge(
					'-m-2.5 p-2.5 pr-0 text-primary',
					isLoggedIn && routeType === 'internal' ? 'xl:hidden' : 'sm:hidden',
				)}
				onClick={() => setSidebarOpen(true)}
				type="button"
			>
				<span className="sr-only">Open sidebar</span>
				<Icon aria-hidden="true" name="menu" size="md" />
			</button>
			<div className="flex flex-1 justify-between self-stretch">
				<div className="flex flex-row align-middle">
					<LogoButton isLoggedIn={isLoggedIn} />

					{!['internal', 'other'].includes(routeType) &&
						marketingNavItems.map(({ href, name }) => (
							<Link key={name} to={href}>
								<Button
									className="hidden h-full pt-2 text-secondary-foreground sm:block"
									variant="link"
								>
									{name}
								</Button>
							</Link>
						))}
				</div>
				<div className="sm:ml-2 flex">
					{!isLoggedIn ? (
						<>
							<div className="place-content-center hidden sm:block">
								<ThemeSwitch userPreference={theme} />
							</div>
							<LoginButton />
							<TryButton />
						</>
					) : (
						<div className="flex gap-x-2 place-items-center">
							<ThemeSwitch userPreference={theme} />
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										className="rounded-full"
										size="icon"
										variant="secondary"
									>
										<Icon className="size-5" name="avatar" />
										<span className="sr-only">Toggle user menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<Link to="/dashboard">
										<DropdownMenuItem>Dashboard</DropdownMenuItem>
									</Link>
									<Link to="/settings">
										<DropdownMenuItem>Settings</DropdownMenuItem>
									</Link>
									<Link to="/contact">
										<DropdownMenuItem>Contact Us</DropdownMenuItem>
									</Link>
									{/* <DropdownMenuItem>Support</DropdownMenuItem> */}
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
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

function LogoButton({ isLoggedIn }: { isLoggedIn: boolean }) {
	return (
		<Link className="" to={isLoggedIn ? '/dashboard' : '/'}>
			<div className="mr-4 flex h-full flex-col justify-center ">
				<Logo />
			</div>
		</Link>
	)
}

function LoginButton() {
	return (
		<Link to="/login">
			<Button
				className="mx-2 h-full px-2 text-secondary-foreground"
				variant="link"
			>
				Login
			</Button>
		</Link>
	)
}

function TryButton({ className }: { className?: string }) {
	return (
		<Link
			className={cn('flex items-center align-middle', className)}
			to="/signup"
		>
			<Button className="text-white">Signup</Button>
		</Link>
	)
}
