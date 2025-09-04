import { Heading } from '#app/components/heading'
import { ListView } from '#app/components/list-view'
import { Spacer } from '#app/components/spacer'
import { Skeleton } from '#app/components/ui/skeleton'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { decodeSearchString } from '#app/utils/misc'
import { getAllRelationObjs } from '#app/utils/newUtils.server'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { getSearchParams } from '#app/utils/urls'
import { Suspense } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { Await, useLoaderData } from 'react-router'
import { model } from './__editor'

// const relationKeys = typedKeys(model.relations)

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

	const objs = await db.query.persona.findMany({
		where: {
			tenantId: user.tenantId,
		},
	})

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
	}
}

export default function ListPage() {
	const { objs } = useLoaderData<typeof loader>()

	return (
		<div className="">
			<Heading model={model} type="list" />
			<Spacer size="4xs" />
			<Suspense fallback={<Skeleton className="h-[100px] rounded-md" />}>
				<Await resolve={objs}>
					{(objs) => <ListView items={objs} linkToDetails model={model} />}
				</Await>
			</Suspense>
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
