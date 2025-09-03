import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { data } from 'react-router'
import { z } from 'zod'
import { OptimisticItemSection } from '#app/components/prd/optimistic-item-section.js'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { models } from '#app/utils/models'
import type { ExistingAndSuggestedClient } from '#app/utils/sort-objs'
import getStories from '#app/utils/suggestions.server/get-stories.js'
import { createToastHeaders } from '#app/utils/toast.server.js'
import type { Route } from './+types/prd-personas'

const schema = z.object({
	prdId: z.string(),
	regenerate: z.coerce.boolean().optional(),
})

const model = models.story

export async function action({ request }: Route.ActionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const user = await getUser(request)
	invariantResponse(user, 'Not found', { status: 403 })
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { prdId, regenerate } = result.value
	if (regenerate) {
		const result = await getStories({ prdId, user, regenerate })
		const headers = await createToastHeaders({
			description: 'Suggestions regenerated',
			type: 'success',
		})
		return data(
			{ success: true, regenerated: true, tickets: result },
			{ headers },
		)
	}
	return result.reply()
}

export function StoriesSection({
	prdId,
	stories,
	prdStories,
	isEditor,
}: {
	prdId: string
	stories: ExistingAndSuggestedClient[]
	prdStories: ExistingAndSuggestedClient[]
	isEditor: boolean
}) {
	return (
		<OptimisticItemSection
			prdId={prdId}
			items={stories}
			itemType="story"
			isEditor={isEditor}
			model={model}
			actionUrl="/resources/prd-stories"
		/>
	)
}
