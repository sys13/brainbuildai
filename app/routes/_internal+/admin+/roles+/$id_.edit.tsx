import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { getUser, requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { invariantResponse } from '#app/utils/misc'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor, model } from './__editor'

export { action } from './__editor.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { tenantId } = await requireAdminUser(request)
	const user = await getUser(request)

	if (!user) {
		throw Error('User not found')
	}

	const { id } = params
	invariantResponse(id, 'Not found', { status: 404 })

	const rawObj = await db.query[model.schemaKey].findFirst({
		where: { id, tenantId },
		// with: withCols,
	})
	invariantResponse(rawObj, 'Not found', { status: 404 })

	// const { permissions, privileges } = await reqAuthAndGetPermissions({
	// 	id,
	// 	modelName: model.name,
	// 	operation: 'edit',
	// 	user,
	// })

	return {
		canDelete: true,
		obj: rawObj,
		// permissions,
		relations: {
			// useCase: {
			// 	all: await getAllByModel({
			// 		model: models.useCase,
			// 		tenantId,
			// 	}),
			// 	existing: rawObj.useCase.map((obj) => obj.useCase),
			// },
		},
	}
}

export default function Edit() {
	const { canDelete, obj, relations } = useLoaderData<typeof loader>()
	return (
		<>
			<Heading
				canDelete={canDelete}
				canEdit={true}
				id={obj.id}
				model={model}
				name={obj.name}
				permissions={[]}
				type="edit"
			/>
			<Editor obj={obj} relations={relations} />
		</>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
