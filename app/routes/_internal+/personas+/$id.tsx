import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { DetailsBase } from '#app/components/details-base'
import { Spacer } from '#app/components/spacer'
import { reqAuthAndGetPermissions } from '#app/models/authorization.server'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { createSuggestedDescription } from '#app/utils/create-suggested-description'
import { db } from '#app/utils/db.server'
import deleteAction from '#app/utils/deleteAction.server'
import { invariantResponse } from '#app/utils/misc'
import ObjErrorBoundary from '#app/utils/objErrorBoundary'
import { model } from './__editor'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { tenantId } = await requireInternalUser(request)
	const user = await getUser(request)
	invariantResponse(user, 'Not found', { status: 403 })

	const { id } = params
	invariantResponse(id, 'Not found', { status: 404 })

	const { permissions, privileges } = await reqAuthAndGetPermissions({
		id,
		modelName: model.name,
		operation: 'read',
		user,
	})

	const rawObj = await db.query[model.schemaKey].findFirst({
		where: { id, tenantId },
	})

	// const starred = await hasStarredQuery({ id, model, user })
	// const rolesAndAssignments = await getAssignments({
	// 	id,
	// 	modelName: model.name,
	// 	tenantId,
	// })

	invariantResponse(rawObj, 'Not found', { status: 404 })

	let suggestedDescription: null | Promise<null | string> | string =
		rawObj.suggestedDescription
	if (
		(rawObj.description === null || rawObj.description === '') &&
		rawObj.suggestedDescription === null
	) {
		suggestedDescription = createSuggestedDescription({
			id,
			model,
			name: rawObj.name,
			tenantId,
		})
	}

	return {
		canDelete: privileges.includes('manage'),
		canEdit: privileges.includes('edit'),
		obj: {
			...rawObj,
			suggestedDescription,
			// starred
		},
		permissions,
		relations: {
			// userFlow: {
			// 	allObjs: await db.query.userFlow.findMany({
			// 		where: and(
			// 			filterByProject({ prdId, tenantId }),
			// 			eq(userFlowSchema.isAccepted, true),
			// 		),
			// 	}),
			// 	selectedObjs: rawObj.userFlows.map((obj) => obj.userFlow),
			// },
			// event: rawObj.event.map((obj) => obj.event),
			// material: rawObj.material.map((obj) => obj.material),
		},
		// rolesAndAssignments,
	}
}

export const action = deleteAction.bind(null, model)
export default function Details() {
	const {
		canDelete,
		canEdit,
		obj,
		permissions,
		// relations
	} = useLoaderData<typeof loader>()

	// const pendingItems = getPendingItems(['persona', 'feature'])

	// const descriptions = compact([
	// 	obj.url
	// 		? {
	// 				title: 'Link',
	// 				values: [{ value: obj.url, to: obj.url }],
	// 			}
	// 		: null,
	// 	{
	// 		title: 'Type',
	// 		value: linkTypes.find(([name]) => name === (obj.type as string))?.[1],
	// 	},
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
				permissions={permissions}
				showTimestamps={false}
			/>
			{/* <DescriptionArea className="mb-3 mt-1" descriptions={descriptions} /> */}
			<Spacer size="4xs" />
			{/* <RelationsCombo
				mainModelId={obj.id}
				mainModelName={model.name}
				model={models.userFlow}
				{...relations.userFlow}
			/> */}
		</>
	)
}

export const ErrorBoundary = ObjErrorBoundary.bind(null, model)
