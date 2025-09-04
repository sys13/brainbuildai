import { sql } from 'drizzle-orm'
import type { LoaderFunctionArgs } from 'react-router'
import { Form, useLoaderData, useSearchParams } from 'react-router'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { Heading } from '#app/components/heading'
import { ComboInput } from '#app/components/inputs/combo-input'
import { ObjList } from '#app/components/obj-list'
import { Spacer } from '#app/components/spacer'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import { requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { idNameCreatedAtCols } from '#app/utils/db-utils.server'
import { decodeSearchString } from '#app/utils/misc'
import { getAllRelationObjs } from '#app/utils/newUtils.server'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { typedKeys } from '#app/utils/ts-utils'
import { getSearchParams } from '#app/utils/urls'
import { model } from './__editor'

const relationKeys = typedKeys(model.relations)

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireAdminUser(request)

	const searchParams = getSearchParams(request.url)
	const searchString = decodeSearchString(searchParams.get('searchString'))
	// const defaultValues = getDefaultValuesFromSearchParams(
	// 	model,
	// 	new URL(request.url).searchParams,
	// )

	const rawObjs = await db.query[model.schemaKey].findMany({
		...idNameCreatedAtCols,
		where: {
			tenantId: user.tenantId,
			...(searchString
				? sql<string>`vector_text @@ to_tsquery('english', ${searchString})`
				: undefined),
		},
	})

	const objs = rawObjs.map((obj) => ({
		...obj,
		relations: {},
	}))

	return {
		objs,
		relations: await getAllRelationObjs(model, user),
	}
}

export default function RouteComponent() {
	const { objs, relations } = useLoaderData<typeof loader>()
	const submit = useDebounceSubmit()
	const [searchParams] = useSearchParams()
	const defaultSearchString = searchParams.get('searchString') || ''
	const formId = `${model.name}-list`

	return (
		<div className="">
			<Heading model={model} type="list" />
			<Spacer size="4xs" />
			<Form
				className="flex space-x-4"
				id={formId}
				onBlur={(event) => {
					submit(event.currentTarget, { debounceTimeout: 0 })
				}}
				onChange={(event) => {
					submit(event.currentTarget, { debounceTimeout: 500 })
				}}
			>
				<div>
					<Label htmlFor="search">Search</Label>
					<Input
						defaultValue={defaultSearchString}
						id="search"
						name="searchString"
						type="text"
					/>
				</div>
				{relationKeys.map((key) => (
					<div className="flex" key={key}>
						<ComboInput
							className="self-end"
							formId={formId}
							key={key}
							modelName={key}
							parentModelName={model.name}
							relations={relations}
							searchParams={searchParams}
						/>
					</div>
				))}
			</Form>
			<Spacer size="4xs" />
			<ObjList data={objs} model={model} prdId="" tableRelations={[]} />
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
