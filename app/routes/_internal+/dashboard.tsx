import {
	Link,
	type LoaderFunctionArgs,
	type MetaFunction,
	useLoaderData,
} from 'react-router'
import ButtonLink from '#app/components/link-button'
import { Button } from '#app/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { Icon } from '#app/components/ui/icon'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import type { Item } from '#app/utils/misc'
import { models } from '#app/utils/models'

export const meta: MetaFunction = () => [{ title: 'BrainBuild - Dashboard' }]

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { tenantId } = await requireInternalUser(request)

	// redirect to onboarding if not completed
	const { completedOnboarding } =
		(await db.query.tenant.findFirst({
			columns: { completedOnboarding: true },
			where: { id: tenantId },
		})) ?? {}

	// if (!completedOnboarding) {
	// 	return redirect('/setup')
	// }

	const filter = {
		columns: { id: true, name: true },
		where: { tenantId },
	} as const
	// return prds
	const data = await db.query.tenant.findFirst({
		where: { id: tenantId },
		with: {
			prds: filter,
			personas: filter,
			products: filter,
		},
	})

	return {
		completedOnboarding,
		data,
	}
}

export default function Dashboard() {
	const { data, completedOnboarding } = useLoaderData<typeof loader>()
	const { prds = [], personas = [], products = [] } = data ?? {}

	// Show call-to-action when user has no PRDs
	if (prds.length === 0) {
		return (
			<div className="space-y-6">
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon name="square-kanban" className="text-primary" />
							Welcome to BrainBuild!
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							Get started by creating your first Product Requirements Document
							(PRD). PRDs help you organize your product ideas, features, and
							requirements.
						</p>
						<div className="flex gap-2">
							<ButtonLink
								to={completedOnboarding ? '/prds/new' : '/setup'}
								size="lg"
							>
								<Icon name="plus">Create Your First PRD</Icon>
							</ButtonLink>
						</div>
					</CardContent>
				</Card>

				{/* Show empty state for other items */}
				<div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
					<Cell data={personas} model={models.persona} />
					<Cell data={products} model={models.product} />
				</div>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
			<Cell data={prds} model={models.prd} />
			<Cell data={personas} model={models.persona} />
			<Cell data={products} model={models.product} />
		</div>
	)
}

const ITEMS_LIMIT = 1000

function Cell({
	data,
	model,
	prdId,
}: {
	data: Item[]
	model: (typeof models)[keyof typeof models]
	prdId?: string
}) {
	const firstItems = data.slice(0, ITEMS_LIMIT + 1)
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex space-between w-full">
					<div className="flex-1 place-content-center">
						<Icon className="mr-2" name={model.icon}>
							<span>{model.displayNames.plural}</span>
						</Icon>
					</div>
					<div>
						<ButtonLink
							to={model.inProject ? model.newUrl(prdId ?? '') : model.newUrl()}
						>
							<Icon name={model.icon}>New {model.displayNames.singular}</Icon>
						</ButtonLink>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="list-disc list-inside">
					{firstItems.map((item) => (
						<li className="flex items-start p-1 py-0.5" key={item.id}>
							<span className="mr-2 shrink-0 text-xl leading-6">•</span>
							<Link
								className="link line-clamp-1 flex-1"
								key={item.id}
								to={
									model.inProject
										? model.detailsUrl(item.id, prdId ?? '')
										: model.detailsUrl(item.id)
								}
							>
								{item.name}
							</Link>
						</li>
					))}
					{data.length === 0 && (
						<Link
							to={
								model.inProject ? model.listUrl(prdId ?? '') : model.listUrl()
							}
						>
							<Button variant="outline">
								Generate {model.displayNames.lowerPlural}
							</Button>
						</Link>
					)}
					{data.length > ITEMS_LIMIT ? (
						<Link
							className="link mt-2 inline-block min-w-0 text-secondary-foreground/70"
							to={
								model.inProject ? model.listUrl(prdId ?? '') : model.listUrl()
							}
						>
							See all {data.length} items
						</Link>
					) : null}
				</ul>
			</CardContent>
		</Card>
	)
}
