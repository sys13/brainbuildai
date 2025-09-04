import { DataTable } from '#app/components/data-table'
import { Button } from '#app/components/ui/button'
import InPlaceAdd from '#app/routes/resources+/in-place-add'
import type { models } from '#app/utils/models'
import type { ItemMaySuggested } from '#app/utils/types'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { usePRDData } from '#app/utils/useProjectData'
import { DataTableColumnHeader } from './ui/data-table-column-header'

export function DetailsRelation<T extends keyof typeof models>({
	canEdit,
	detailsUrlFilter,
	inlineAdd = true,
	mainId,
	mainModel,
	model,
	showFlushedOutStatus,
	showNew,
	...props
}: {
	canEdit?: boolean
	detailsUrlFilter?: string
	inlineAdd?: boolean
	mainId: string
	mainModel: (typeof models)[keyof typeof models]
	model: (typeof models)[T]
	showFlushedOutStatus?: boolean
	showNew?: boolean
} & ({ data: ItemMaySuggested[] } | { loading: true })) {
	const { prd } = usePRDData() ?? {}
	if (!prd) {
		return null
	}
	// biome-ignore lint/correctness/useHookAtTopLevel: misc
	const columns: ColumnDef<ItemMaySuggested>[] = useMemo(() => {
		return [
			{
				accessorKey: 'name',
				cell: ({ row }) => {
					return (
						<>
							<Link
								to={
									model.detailsUrl(row.original.id, prd.id) +
									(detailsUrlFilter ?? '')
								}
							>
								<Button className="text-left" variant="link">
									{row.original.name}{' '}
								</Button>
							</Link>
							{showFlushedOutStatus && !row.original.flushedOut ? (
								<span className="ml-2 text-muted-foreground">
									No details added yet
								</span>
							) : null}
						</>
					)
				},
				enableSorting: false,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
			},
		]
	}, [model, showFlushedOutStatus, detailsUrlFilter, prd?.id])

	const filterString = `?${mainModel.name}Id=${mainId}`

	const newURL = model.newUrl(prd.id) + filterString
	const listURL = model.listUrl(prd.id) + filterString

	return (
		<div>
			<div className="mb-3 flex justify-between align-middle">
				<Link className="hover:link" to={listURL}>
					<h2 className="pt-1 text-h5">{model.displayNames.plural}</h2>
				</Link>
				{showNew && canEdit ? (
					<Link className="ml-4" to={newURL}>
						<Button className="" variant="outline">
							New {model.displayNames.singular}
						</Button>
					</Link>
				) : null}
			</div>
			{'data' in props ? (
				<DataTable
					columns={columns}
					data={props.data}
					inPlaceAdd={
						inlineAdd && (
							<InPlaceAdd mainId={mainId} mainModel={mainModel} model={model} />
						)
					}
					showHeader={false}
				/>
			) : null}
		</div>
	)
}
