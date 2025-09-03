import type { LoaderFunctionArgs } from 'react-router'
import { Heading } from '#app/components/heading'
import { requireInternalUser } from '#app/utils/auth.server'
import { models } from '#app/utils/models'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor } from './$prdId+/__prd-editor'

const model = models.prd

export { action } from './$prdId+/__prd-editor.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireInternalUser(request)
	return {}
}

export default function New() {
	// const { relations } = useLoaderData<typeof loader>()
	return (
		<div className="">
			<Heading model={model} type="new" />
			<Editor />
		</div>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
