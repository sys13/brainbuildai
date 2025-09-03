import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { useActionData, useFetcher, useLoaderData } from 'react-router'
import { z } from 'zod'
import { FormField } from '#app/components/form-fields-builder'
import { FormSubmitButton } from '#app/components/form-submit-button'
import { Spacer } from '#app/components/spacer'
import { Button } from '#app/components/ui/button'
import { requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { tenant } from '#db/schema/base'

const schema = z.object({
	accountName: z.string(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const { tenantId } = await requireAdminUser(request)
	const tenant = await db.query.tenant.findFirst({
		columns: { name: true },
		where: { id: tenantId },
	})
	return { accountName: tenant?.name ?? '' }
}

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireAdminUser(request)
	const formData = await request.formData()

	const submission = parseWithZod(formData, {
		schema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { accountName } = submission.value

	const newValues = {
		updatedAt: new Date(),
	}

	await db
		.update(tenant)
		.set({ name: accountName, updatedAt: newValues.updatedAt })
		.where(eq(tenant.id, tenantId))

	return redirectWithToast('/admin/account', {
		description: 'Account updated',
		type: 'success',
	})
}

export default function Account() {
	const { accountName } = useLoaderData<typeof loader>()
	const fetcher = useFetcher<typeof action>()
	const lastResult = useActionData<typeof action>()
	const isPending = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		defaultValue: {
			accountName,
		},
		id: 'account-editor',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})
	return (
		<div>
			<form action="/resources/create-portal-session" method="POST">
				<Button
					id="checkout-and-portal-button"
					type="submit"
					variant="secondary"
				>
					Manage your billing information
				</Button>
			</form>
			<Spacer size="4xs" />
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				autoComplete="off"
				className="h-full pb-28"
			>
				<FormField
					field={fields.accountName}
					inputType="input"
					title="Account Name"
				/>

				<div className="flex flex-col gap-6" />
				<FormSubmitButton formId={form.id} isPending={isPending} />
			</fetcher.Form>
		</div>
	)
}
