import type { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router'
import { DataTable } from '#app/components/data-table'
import { Button } from '#app/components/ui/button'
import { DataTableColumnHeader } from '#app/components/ui/data-table-column-header'
import type { Item } from '#app/utils/misc'
import type { models } from '#app/utils/models'

export function DashboardSection<T extends keyof typeof models>({
	data,
	model,
	prdId,
	showNew = true,
}: {
	data: Item[]
	model: (typeof models)[T]
	prdId?: string
	showNew?: boolean
}) {
	if (prdId === undefined) {
		throw new Error('prdId is required for prd models')
	}

	const columns: ColumnDef<Item>[] = [
		{
			accessorKey: 'name',
			cell: ({ row }) => (
				<Link
					to={
						model.inProject
							? model.detailsUrl(row.original.id, prdId)
							: model.detailsUrl(row.original.id)
					}
				>
					<Button variant="link">{row.original.name}</Button>
				</Link>
			),
			enableSorting: false,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
		},
	]
	return (
		<div>
			<div className="hover:link mb-3 flex justify-between align-middle">
				<Link to={model.inProject ? model.listUrl(prdId) : model.listUrl()}>
					<h2 className="pt-1 text-h4">{model.displayNames.plural}</h2>
				</Link>
				{showNew ? (
					<Link
						className="ml-4"
						to={model.inProject ? model.newUrl(prdId) : model.newUrl()}
					>
						<Button className="">New {model.displayNames.singular}</Button>
					</Link>
				) : null}
			</div>
			<DataTable columns={columns} data={data} />
		</div>
	)
}
