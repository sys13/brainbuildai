import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { DataTable } from '#app/components/data-table'
import { DataTableColumnHeader } from '#app/components/ui/data-table-column-header'
import { requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const { tenantId } = await requireAdminUser(request)

	const users = await db.query.user.findMany({
		columns: { email: true, id: true, name: true },
		where: { tenantId },
	})
	return { users }
}

export default function Users() {
	const { users } = useLoaderData<typeof loader>()
	const columns: ColumnDef<{
		email: null | string
		id: string
		name: null | string
	}>[] = useMemo(() => {
		return [
			{
				accessorKey: 'name',
				cell: ({ row }) => row.original.name ?? '',
				enableSorting: false,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
			},
			{
				accessorKey: 'email',
				cell: ({ row }) => row.original.email,
				enableSorting: false,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
			},
		]
	}, [])
	return (
		<div>
			{/* {showNew ? (
				<Link
				to={
					model.newUrl()
				}
				className="ml-4"
				>
				<Button className="">New {model.displayNames.singular}</Button>
				</Link>
				) : null}
			</div> */}
			<DataTable columns={columns} data={users} />
		</div>
	)
}
