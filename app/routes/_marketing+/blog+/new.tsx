import type { LoaderFunctionArgs } from 'react-router'
import { requireSuperAdminUser } from '#app/utils/auth.server'
import { Editor } from './__post-editor'

export { action } from './__post-editor.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireSuperAdminUser(request)
	return {}
}

export default function New() {
	// const { relations } = useLoaderData<typeof loader>()
	return (
		<div className="m-4">
			<h1 className="text-h1">New Article</h1>
			<Editor />
		</div>
	)
}
