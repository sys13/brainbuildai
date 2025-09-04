import { Suspense } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { Await, useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { PrdListView } from '#app/components/prd-list-view.js'
import { Spacer } from '#app/components/spacer'
import { Skeleton } from '#app/components/ui/skeleton'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { decodeSearchString } from '#app/utils/misc'
import { models } from '#app/utils/models'
import { getAllRelationObjs } from '#app/utils/newUtils.server'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { getSearchParams } from '#app/utils/urls'
export const model = models.prd
// const relationKeys = typedKeys(model.relations)

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const user = await requireInternalUser(request)

	const searchParams = getSearchParams(request.url)
	const _searchString = decodeSearchString(searchParams.get('searchString'))
	const _moreSuggestions = Number(searchParams.get('moreSuggestions'))
	// const defaultValues = getDefaultValuesFromSearchParams(
	// 	model,
	// 	new URL(request.url).searchParams,
	// )

	// const objs = getPersonas({ moreSuggestions, user }).then((objs) => {
	// 	return objs.filter(({ name }) =>
	// 		name.toLowerCase().includes(searchString.toLowerCase()),
	// 	)
	// })

	const objs = await db.query.prd.findMany({
		where: {
			tenantId: user.tenantId,
		},
	})
	const { completedOnboarding } =
		(await db.query.tenant.findFirst({
			columns: { completedOnboarding: true },
			where: { id: user.tenantId },
		})) ?? {}
	// const rawObjs = await db.query[model.schemaKey].findMany({
	// 	...idNameCreatedAtCols,
	// 	where: and(
	// 		filterByTenantAndProject({ prdId, tenantId: user.tenantId }),
	// 		searchString
	// 			? sql<string>`vector_text @@ to_tsquery('english', ${searchString})`
	// 			: undefined,
	// 	),
	// })

	// const objs = rawObjs.map((obj) => ({
	// 	...obj,
	// 	relations: {},
	// }))

	return {
		objs,
		relations: await getAllRelationObjs(model, user),
		completedOnboarding,
	}
}

export default function ListPage() {
	const { objs, completedOnboarding } = useLoaderData<typeof loader>()
	return (
		<div className="">
			<Heading model={model} type="list" />
			<Spacer size="4xs" />
			<Suspense fallback={<Skeleton className="h-[100px] rounded-md" />}>
				<Await resolve={objs}>
					{(objs) => (
						<PrdListView
							prds={objs}
							model={model}
							completedOnboarding={completedOnboarding ?? false}
						/>
					)}
				</Await>
			</Suspense>
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
