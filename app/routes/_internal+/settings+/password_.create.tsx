import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import {
	type ActionFunctionArgs,
	Form,
	Link,
	type LoaderFunctionArgs,
	data,
	redirect,
	useActionData,
} from 'react-router'
import { ErrorList, Field } from '#app/components/forms'
import { Button } from '#app/components/ui/button'
import { StatusButton } from '#app/components/ui/status-button'
import { getPasswordHash, requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { useIsPending } from '#app/utils/misc'
import { PasswordAndConfirmPasswordSchema } from '#app/utils/user-validation'
import { password } from '#db/schema/authentication'

const CreatePasswordForm = PasswordAndConfirmPasswordSchema

async function requireNoPassword(userId: string) {
	const passwordResult = await db.query.password.findFirst({
		columns: { userId: true },
		where: { userId },
	})
	if (passwordResult) {
		throw redirect('/settings/password')
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { id: userId } = await requireUser(request)
	await requireNoPassword(userId)
	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId } = await requireUser(request)
	await requireNoPassword(userId)
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		async: true,
		schema: CreatePasswordForm,
	})

	if (submission.status !== 'success') {
		return data(
			{
				result: submission.reply({
					hideFields: ['password', 'confirmPassword'],
				}),
			},
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}

	const { password: passwordResult } = submission.value

	await db
		.update(password)
		.set({
			hash: await getPasswordHash(passwordResult),
		})
		.where(eq(password.userId, userId))

	return redirect('/settings', { status: 302 })
}

export default function CreatePasswordRoute() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		constraint: getZodConstraint(CreatePasswordForm),
		id: 'password-create-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CreatePasswordForm })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form method="POST" {...getFormProps(form)} className="mx-auto max-w-md">
			<Field
				errors={fields.password.errors}
				inputProps={getInputProps(fields.password, { type: 'password' })}
				labelProps={{ children: 'New Password' }}
			/>
			<Field
				errors={fields.confirmPassword.errors}
				inputProps={getInputProps(fields.confirmPassword, {
					type: 'password',
				})}
				labelProps={{ children: 'Confirm New Password' }}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="grid w-full grid-cols-2 gap-6">
				<Button asChild variant="secondary">
					<Link to="..">Cancel</Link>
				</Button>
				<StatusButton
					status={isPending ? 'pending' : (form.status ?? 'idle')}
					type="submit"
				>
					Create Password
				</StatusButton>
			</div>
		</Form>
	)
}
