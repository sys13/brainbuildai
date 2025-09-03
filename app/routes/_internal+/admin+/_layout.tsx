import type { LoaderFunctionArgs } from 'react-router'
import { Outlet } from 'react-router'
import { SidebarNav } from '#app/components/admin-sidebar-nav'
import { Heading } from '#app/components/heading'
import { requireAdminUser } from '#app/utils/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAdminUser(request)
	return {}
}

const sidebarNavItems = [
	{
		href: '/admin/users',
		title: 'Users',
	},
	// {
	// 	href: '/admin/groups',
	// 	title: 'Groups',
	// },
	// {
	// 	href: '/admin/roles',
	// 	title: 'Roles',
	// },
	{
		href: '/admin/account',
		title: 'Account',
	},
]

export default function Admin() {
	return (
		<div className="">
			<Heading noHome title="Admin" />
			<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
				<aside className="-mx-4 lg:w-1/5">
					<SidebarNav items={sidebarNavItems} />
				</aside>
				<div className="flex-1 lg:max-w-2xl">
					<Outlet />
				</div>
			</div>
		</div>
	)
}
