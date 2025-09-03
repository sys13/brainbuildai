import { type LoaderFunctionArgs, useLoaderData } from 'react-router'
import { requireSuperAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { invariantResponse } from '#app/utils/misc'
import { Editor } from './__post-editor'

export { action } from './__post-editor.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireSuperAdminUser(request)
	const { slug } = params
	invariantResponse(slug, 'Not found', { status: 404 })

	const rawObj = await db.query.post.findFirst({
		where: { slug },
	})
	invariantResponse(rawObj, 'Not found', { status: 404 })

	return {
		canDelete: true,
		obj: rawObj,
		permissions: [],
	}
}

export default function Edit() {
	const { obj } = useLoaderData<typeof loader>()
	return (
		<div className="p-4 w-full flex flex-col place-items-center">
			<div className="text-h1 max-w-2xl">Edit Article</div>
			<Editor className="w-full max-w-2xl" obj={obj} />
		</div>
	)
}
