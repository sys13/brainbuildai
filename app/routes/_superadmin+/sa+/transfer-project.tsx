import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { useActionData, useFetcher, useLoaderData } from 'react-router'
import { z } from 'zod'
import { SelectConform } from '#app/components/inputs/select-conform'
import { StatusButton } from '#app/components/ui/status-button'
import { requireSuperAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { transferProject } from '#app/utils/transfer-project.server'

const schema = z.object({
	prdId: z.string(),
	userId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId: oldTenantId } = await requireSuperAdminUser(request)
	const formData = await request.formData()

	const submission = parseWithZod(formData, {
		schema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const newTenantId = (
		await db.query.user.findFirst({
			columns: { tenantId: true },
			where: { id: submission.value.userId },
		})
	)?.tenantId
	invariantResponse(newTenantId, 'User not found')

	await transferProject({
		newTenantId,
		oldTenantId,
		...submission.value,
	})

	return {}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { tenantId } = await requireSuperAdminUser(request)

	const users = await db.query.user.findMany({
		columns: { email: true, id: true },
	})

	const projects = await db.query.prd.findMany({
		columns: { id: true, name: true },
		where: { tenantId },
	})

	return { projects, users }
}

export default function TransferProject() {
	const { projects, users } = useLoaderData<typeof loader>()

	const lastResult = useActionData<typeof action>()
	// const [description, setDescription] = React.useState(obj?.description ?? '')
	const fetcher = useFetcher<typeof action>()
	const isPending = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'transfer-project',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema,
			})
		},
	})

	const userItems = users.map((user) => ({
		id: user.id,
		name: user.email,
	}))

	return (
		<div>
			<h1 className="mb-4">TransferProject</h1>
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				autoComplete="off"
				className="space-x-4 flex"
			>
				<SelectConform items={userItems} meta={fields.userId} title="User" />
				<SelectConform items={projects} meta={fields.prdId} title="Project" />
				<StatusButton
					disabled={isPending}
					form={form.id}
					status={isPending ? 'pending' : 'idle'}
					type="submit"
				>
					Save
				</StatusButton>
			</fetcher.Form>
		</div>
	)
}
