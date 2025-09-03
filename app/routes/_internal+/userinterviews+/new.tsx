import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import {
	getAllRelationObjs,
	getDefaultValuesFromSearchParams,
} from '#app/utils/newUtils.server'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor, model } from './__editor'
export { action } from './__editor.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await requireInternalUser(request)
	const searchParams = new URL(request.url).searchParams
	const prdId = searchParams.get('prdId') ?? ''
	// invariantResponse(prdId, 'Not found', { status: 404 })

	// return prds
	// const rawObj = await db.query[model.schemaKey].findFirst({
	// 		where: { id, tenantId },
	// 	})
	const rawObj = await db.query.prd.findMany({
		where: { tenantId: user.tenantId },
		columns: {
			createdAt: true,
			id: true,
			isAccepted: true,
			isAddedManually: true,
			isSuggested: true,
			name: true,
			updatedAt: true,
		},
	})
	return {
		defaultValues: getDefaultValuesFromSearchParams(
			model,
			new URL(request.url).searchParams,
		),
		relations: await getAllRelationObjs(model, user),
		data: rawObj,
		prdId,
	}
}

export default function New() {
	const { defaultValues, data, prdId } = useLoaderData<typeof loader>()

	return (
		<div className="">
			<Heading model={model} type="new" />
			<Editor
				data={data}
				prdId={[prdId]}
				defaultValues={defaultValues}
				// relations={relations}
			/>
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
