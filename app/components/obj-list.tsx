import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { DataTable } from '#app/components/data-table'
import { Button } from '#app/components/ui/button'
import type { Item } from '#app/utils/misc'
import { models } from '#app/utils/models'
import { compact } from '#app/utils/ts-utils'
import type { ItemMaySuggested } from '#app/utils/types'
import { DataTableColumnHeader } from './ui/data-table-column-header'

export function ObjList<T extends keyof typeof models>({
	data,
	model,
	prdId,
	tableRelations,
}: {
	data: ItemMaySuggested[]
	model: (typeof models)[T]
	prdId: string
	tableRelations: (keyof typeof models)[]
}) {
	const suggestedSortedData = data.sort((a, b) => {
		if (a.isSuggested && !b.isSuggested) {
			return 1
		}

		if (!a.isSuggested && b.isSuggested) {
			return -1
		}
		return 0
	})
	const columns: ColumnDef<ItemMaySuggested>[] = useMemo(() => {
		return [
			{
				accessorKey: 'name',
				cell: ({ row }) => {
					return (
						<Link
							className=""
							to={
								model.inProject
									? model.detailsUrl(row.original.id, prdId)
									: model.detailsUrl(row.original.id)
							}
						>
							<Button variant="link">{row.original.name}</Button>
						</Link>
					)
				},
				enableSorting: false,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
			},
			...tableRelations.map((relation) => ({
				accessorKey: relation,
				enableSorting: false,
				// @ts-expect-error: column is not defined
				cell: ({ row }) => {
					const relationData = row.original.relations[relation] as
						| Item[]
						| undefined

					if (relationData === undefined) {
						return null
					}

					return (
						<div className="flex flex-wrap">
							{compact([relationData].flat()).map((obj, i) => (
								<div
									className="inline"
									key={row.original.id + models[relation] + obj.id}
								>
									<Link
										className="link"
										key={row.original.id + models[relation] + obj.id}
										to={models[relation].detailsUrl(obj.id, prdId)}
									>
										{obj.name}
									</Link>
									{i < relationData.length - 1 && (
										<span className="mr-1">, </span>
									)}
								</div>
							))}
						</div>
					)
				},
				// @ts-expect-error: column is not defined
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={models[relation].displayNames.plural}
					/>
				),
			})),
		]
	}, [model, tableRelations, prdId])
	return <DataTable columns={columns} data={suggestedSortedData} />
}
