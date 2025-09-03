import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { Heading } from '#app/components/heading'
import { reqAuthAndGetPermissions } from '#app/models/authorization.server'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { invariantResponse } from '#app/utils/misc'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { Editor, model } from './__editor'

export { action } from './__editor.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id: userId, tenantId } = await requireInternalUser(request)
	const user = await getUser(request)

	if (!user) {
		throw Error('User not found')
	}

	const { id } = params
	invariantResponse(id, 'Not found', { status: 404 })
	const rawObj = await db.query[model.schemaKey].findFirst({
		where: { id, tenantId },
	})
	const data = await db.query.prd.findMany({
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
	invariantResponse(rawObj, 'Not found', { status: 404 })

	const { permissions, privileges } = await reqAuthAndGetPermissions({
		id,
		modelName: model.name,
		operation: 'edit',
		user,
	})
	const prdRelations = await db.query.prdUserInterview.findMany({
		where: {
			userInterviewId: id,
			tenantId,
		},
		columns: { prdId: true },
	})
	const prdIds = prdRelations.map((r) => r.prdId)
	return {
		canDelete: privileges.includes('manage'),
		obj: rawObj,
		data,
		permissions,
		prdIds,
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
	const { canDelete, obj, data, permissions, prdIds } =
		useLoaderData<typeof loader>()
	return (
		<>
			<Heading
				canDelete={canDelete}
				canEdit={true}
				id={obj.id}
				model={model}
				name={obj.name}
				permissions={permissions}
				type="edit"
			/>
			<Editor obj={obj} data={data} prdId={prdIds} />
		</>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
