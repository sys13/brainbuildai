import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { DetailsBase } from '#app/components/details-base'
import { Spacer } from '#app/components/spacer'
import { getUser, requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import deleteAction from '#app/utils/deleteAction.server'
import { invariantResponse } from '#app/utils/misc'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { model } from './__editor'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { tenantId } = await requireAdminUser(request)
	const user = await getUser(request)
	invariantResponse(user, 'Not found', { status: 403 })

	const { id } = params
	invariantResponse(id, 'Not found', { status: 404 })

	// const { permissions, privileges } = await reqAuthAndGetPermissions({
	// 	id,
	// 	modelName: model.name,
	// 	operation: 'read',
	// 	user,
	// })

	const rawObj = await db.query[model.schemaKey].findFirst({
		where: { id, tenantId },
		// with: withCols,
	})

	invariantResponse(rawObj, 'Not found', { status: 404 })

	return {
		canDelete: true,
		canEdit: true,
		obj: rawObj,
		permissions: [],
		relations: {
			// useCase: rawObj.useCase.map((obj) => obj.useCase),
		},
	}
}

export const action = deleteAction.bind(null, model)
export default function Details() {
	const {
		canDelete,
		canEdit,
		obj,
		// relations
	} = useLoaderData<typeof loader>()

	// const pendingItems = getPendingItems(['persona', 'feature'])

	// const descriptions = compact([
	// obj.url
	// 	? {
	// 			title: 'Link',
	// 			values: [{ value: obj.url, to: obj.url }],
	// 		}
	// 	: null,
	// ]) satisfies DescriptionItem[]

	// const detailRelationsProps = {
	// 	canEdit,
	// 	mainId: obj.id,
	// 	mainModel: model,
	// 	showNew: true,
	// } as const satisfies Partial<React.ComponentProps<typeof DetailsRelation>>

	return (
		<>
			<DetailsBase
				canDelete={canDelete}
				canEdit={canEdit}
				model={model}
				obj={obj}
				permissions={[]}
				prdId=""
			/>
			<Spacer size="4xs" />
			{/* <DescriptionArea className="mb-3 mt-1" descriptions={descriptions} /> */}
			{/* <DetailsRelation
				{...detailRelationsProps}
				data={relations.useCase}
				model={models.useCase}
			/> */}
		</>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
