import { invariantResponse } from '@epic-web/invariant'
import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { requireInternalUser } from '#app/utils/auth.server'
import {
	getAllRelationObjs,
	getDefaultValuesFromSearchParams,
} from '#app/utils/newUtils.server'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor, model } from './__editor'

export { action } from './__editor.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await requireInternalUser(request)

	const { prdId } = params
	invariantResponse(prdId, 'Not found', { status: 404 })

	return {
		defaultValues: getDefaultValuesFromSearchParams(
			model,
			new URL(request.url).searchParams,
		),
		prdId,
		relations: await getAllRelationObjs(model, user),
	}
}

export default function New() {
	const { defaultValues, prdId } = useLoaderData<typeof loader>()

	return (
		<div className="">
			<Heading model={model} prdId={prdId} type="new" />
			<Editor
				defaultValues={defaultValues}
				// relations={relations}
			/>
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
