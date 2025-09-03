import { useMatches } from 'react-router'
import type { ModelName } from '#app/utils/modelNames'
import { models } from '#app/utils/models'
import { usePRDData } from '#app/utils/useProjectData'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Icon } from './ui/icon'

function BreadcrumbStandard({ href, label }: { href: string; label: string }) {
	return (
		<>
			<BreadcrumbSeparator />
			<BreadcrumbItem>
				<BreadcrumbLink href={href}>{label}</BreadcrumbLink>
			</BreadcrumbItem>
		</>
	)
}

function ListBreadcrumb({
	modelName,
	prdId,
}: {
	modelName: ModelName
	prdId: string
}) {
	return (
		<BreadcrumbStandard
			href={models[modelName].listUrl(prdId)}
			label={models[modelName].displayNames.plural}
		/>
	)
}

function DetailsBreadcrumb({
	id,
	label,
	modelName,
	prdId,
}: {
	id: string
	label: string
	modelName: ModelName
	prdId: string
}) {
	return (
		<BreadcrumbStandard
			href={models[modelName].detailsUrl(id, prdId)}
			label={label}
		/>
	)
}

function extractModelName(matchId: string) {
	const pattern = /routes\/_internal\+\/prds\+\/\$prdId\+\/(.*)\+\//
	const match = pattern.exec(matchId)?.[1]
	if (!match) {
		return null
	}

	const modelName = Object.values(models).find((model) => {
		return (
			match.toLowerCase() === model.displayNames.lowerPlural.replace(/\s+/g, '')
		)
	})?.name
	return modelName
}

function getBreadcrumbsFromMatches(): {
	breadcrumbs: React.ReactNode
	forceShowHome: boolean
} {
	let breadcrumbs: React.ReactNode = null
	const matches = useMatches()
	const relevantMatches = matches.slice(4)

	// get the obj name
	const data = relevantMatches[0]?.data
	const name = (data &&
		typeof data === 'object' &&
		'obj' in data &&
		(data as { obj: { name: string } }).obj.name) as string | undefined

	const modelName = extractModelName(relevantMatches[0]?.id)
	if (modelName == null) {
		return { breadcrumbs: null, forceShowHome: false }
	}
	let forceShowHome = false

	if (relevantMatches.some((match) => match.id.endsWith('$id'))) {
		const { prdId } = relevantMatches[0].params

		breadcrumbs = (
			<ListBreadcrumb key="list" modelName={modelName} prdId={prdId ?? ''} />
		)
	} else if (relevantMatches.some((match) => match.id.endsWith('list.index'))) {
		forceShowHome = true
	} else if (relevantMatches.some((match) => match.id.endsWith('new'))) {
		const { prdId } = relevantMatches[0].params

		breadcrumbs = (
			<ListBreadcrumb key="list" modelName={modelName} prdId={prdId ?? ''} />
		)
	} else if (relevantMatches.some((match) => match.id.endsWith('edit'))) {
		const { id: objId, prdId } = relevantMatches[0].params

		breadcrumbs = (
			<>
				<ListBreadcrumb key="list" modelName={modelName} prdId={prdId ?? ''} />
				<DetailsBreadcrumb
					id={objId ?? ''}
					key="details"
					label={name ?? ''}
					modelName={modelName}
					prdId={prdId ?? ''}
				/>
			</>
		)
	}
	return { breadcrumbs, forceShowHome }
}

export default function BreadcrumbsImpl() {
	const { prd } = usePRDData() ?? {}
	const { breadcrumbs, forceShowHome } = getBreadcrumbsFromMatches()
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					{breadcrumbs !== null || forceShowHome ? (
						<BreadcrumbLink href={`/prds/${prd?.id}`}>
							<Icon className="mb-0.5" name="home" />
						</BreadcrumbLink>
					) : null}
				</BreadcrumbItem>
				{breadcrumbs}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
