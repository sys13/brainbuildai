import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	redirect,
	useActionData,
	useFetcher,
} from 'react-router'
import { z } from 'zod'
import { floatingToolbarClassName } from '#app/components/floating-toolbar'
import { FormField } from '#app/components/form-fields-builder'
import { Button } from '#app/components/ui/button'
import { StatusButton } from '#app/components/ui/status-button'
import { createTenant } from '#app/models/tenant.server'
import { requireSuperAdminUser } from '#app/utils/auth.server'

const schema = z.object({
	name: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	await requireSuperAdminUser(request)
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		async: true,
		schema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { name } = submission.value

	await createTenant({ name })

	return redirect('/sa')
}

export default function AddTenant() {
	const fetcher = useFetcher<typeof action>()
	const lastResult = useActionData<typeof action>()
	const isPending = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'add-tenant-editor',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})

	return (
		<div className="">
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				autoComplete="off"
				className="h-full pb-28 pt-6"
			>
				<FormField autoFocus field={fields.name} inputType="input" />

				<div className={floatingToolbarClassName}>
					<Button form={form.id} type="reset" variant="destructive">
						Reset
					</Button>
					<StatusButton
						disabled={isPending}
						form={form.id}
						status={isPending ? 'pending' : 'idle'}
						type="submit"
					>
						Submit
					</StatusButton>
				</div>
			</fetcher.Form>
		</div>
	)
}
