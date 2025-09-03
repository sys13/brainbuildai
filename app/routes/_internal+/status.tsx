import React from 'react'
import { redirect, useFetcher } from 'react-router'
import { Icon } from '#app/components/ui/icon'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { tenant } from '#db/schema/base'
import type { Route } from './+types/status'

export async function loader({ request }: Route.LoaderArgs) {
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
		return redirect('/prds/new')
	}

	return { jobStatus: job?.status }
}

export async function action({ request }: Route.ActionArgs) {
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
		if (job?.status === 'complete') {
			await db.update(tenant).set({
				completedOnboarding: true,
			})
			return redirect('/prds/new')
		}
	}

	return { jobStatus: job?.status }
}

export default function Status({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	// const {} = loaderData

	const fetcher = useFetcher<typeof actionData>()
	React.useEffect(() => {
		const interval = setInterval(() => {
			fetcher.submit(null, { method: 'post' })
		}, 2000)

		return () => clearInterval(interval)
	}, [fetcher])
	return (
		<div className="flex justify-center items-center space-x-4">
			<Icon name="loader" className="animate-spin" />
			<span className="text-sm font-medium text-secondary-foreground">
				Parsing your company website for context data...
			</span>
		</div>
	)
}
