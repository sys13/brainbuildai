import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { requireAdminUser } from '#app/utils/auth.server'
import {
	getAllRelationObjs,
	getDefaultValuesFromSearchParams,
} from '#app/utils/newUtils.server'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor, model } from './__editor'

export { action } from './__editor.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireAdminUser(request)

	return {
		defaultValues: getDefaultValuesFromSearchParams(
			model,
			new URL(request.url).searchParams,
		),
		relations: await getAllRelationObjs(model, user),
	}
}

export default function New() {
	const { defaultValues, relations } = useLoaderData<typeof loader>()

	return (
		<div className="">
			<Heading model={model} type="new" />
			<Editor defaultValues={defaultValues} relations={relations} />
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
