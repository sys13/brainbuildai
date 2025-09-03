import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { reqAuthAndGetPermissions } from '#app/models/authorization.server'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { invariantResponse } from '#app/utils/misc'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor, model } from './__prd-editor'

export { action } from './__prd-editor.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const user = await getUser(request)

	if (!user) {
		throw Error('User not found')
	}

	const { prdId: id } = params
	invariantResponse(id, 'Not found', { status: 404 })

	const rawObj = await db.query[model.schemaKey].findFirst({
		where: { id, tenantId },
	})
	invariantResponse(rawObj, 'Not found', { status: 404 })

	const { permissions, privileges } = await reqAuthAndGetPermissions({
		id,
		modelName: model.name,
		operation: 'edit',
		user,
	})

	return {
		canDelete: privileges.includes('manage'),
		obj: rawObj,
		permissions,
		prdId: id,
		relations: {
			// event: {
			// 	all: await getAllByModel({
			// 		model: models.event,
			// 		tenantId,
			// 	}),
			// 	existing: rawObj.event.map((obj) => obj.event),
			// },
		},
	}
}

export default function Edit() {
	const { canDelete, obj, permissions, prdId } = useLoaderData<typeof loader>()
	return (
		<>
			<Heading
				canDelete={canDelete}
				canEdit={true}
				id={obj.id}
				model={model}
				name={obj.name}
				permissions={permissions}
				prdId={prdId}
				type="edit"
			/>
			<Editor obj={obj} />
		</>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
