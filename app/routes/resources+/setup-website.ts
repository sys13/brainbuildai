import { parseWithZod } from '@conform-to/zod'
import { data } from 'react-router'
import { z } from 'zod'
// routes/resources/setup-website.ts
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { parseWebsite } from '#app/utils/parseWebsite.js'
import { tenant } from '#db/schema/base'
import { job } from '#db/schema/job.js'

const schema = z.object({
	companyWebsite: z.string().optional(),
})
type ActionResponse =
	| { status: 'success' }
	| { status: 'error'; errors: Record<string, string[]> }
export async function action({ request }: { request: Request }) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()

	const result = parseWithZod(formData, {
		schema: schema.superRefine((data, ctx) => {
			if (
				data.companyWebsite &&
				!/^(https?:\/\/)?[^\s/$.?#].[^\s]*$/.test(data.companyWebsite)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid URL',
				})
			}
		}),
	})

	if (result.status !== 'success')
		return data({ errors: result.error }, { status: 400 })

	const { companyWebsite } = result.value

	if (!companyWebsite) {
		await db.update(tenant).set({ completedOnboarding: true })
		return data({
			status: 'success',
		})
	}
	await db.transaction(async (tx) => {
		await tx.update(tenant).set({
			companyWebsite,
		})

		const jobId = (
			await tx
				.insert(job)
				.values({
					tenantId,
					name: 'setup',
					status: 'pending',
					jobType: 'parseWebsite',
					data: {
						companyWebsite,
					},
				})
				.returning({ id: job.id })
		)[0].id
		parseWebsite({ jobId, companyWebsite, tenantId })
	})

	return data({
		status: 'success',
	})
}
