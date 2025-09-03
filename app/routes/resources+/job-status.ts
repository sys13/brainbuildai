import { data } from 'react-router'
// app/routes/resources/job-status.ts
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { tenant } from '#db/schema/base'

export async function action({ request }: { request: Request }) {
	const { tenantId } = await requireInternalUser(request)

	const job = await db.query.job.findFirst({
		where: {
			tenantId,
			jobType: 'parseWebsite',
		},
		orderBy: {
			createdAt: 'desc',
		},
		columns: {
			status: true,
		},
	})

	if (job?.status === 'complete') {
		await db.update(tenant).set({
			completedOnboarding: true,
		})
	}

	return data({ jobStatus: job?.status ?? 'not_found' })
}
