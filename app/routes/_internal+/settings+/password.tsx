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
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms'
import { Heading } from '#app/components/heading'
import { Button } from '#app/components/ui/button'
import { StatusButton } from '#app/components/ui/status-button'
import {
	getPasswordHash,
	requireUser,
	verifyUserPassword,
} from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { useIsPending } from '#app/utils/misc'
import { redirectWithToast } from '#app/utils/toast.server'
import { PasswordSchema } from '#app/utils/user-validation'
import { password } from '#db/schema/authentication'

const ChangePasswordForm = z
	.object({
		confirmNewPassword: PasswordSchema,
		currentPassword: PasswordSchema,
		newPassword: PasswordSchema,
	})
	.superRefine(({ confirmNewPassword, newPassword }, ctx) => {
		if (confirmNewPassword !== newPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'The passwords must match',
				path: ['confirmNewPassword'],
			})
		}
	})

async function requirePassword(userId: string) {
	const password = await db.query.password.findFirst({
		columns: { userId: true },
		where: { userId },
	})
	if (!password) {
		throw redirect('/settings/password/create')
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { id: userId } = await requireUser(request)
	await requirePassword(userId)
	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId } = await requireUser(request)
	await requirePassword(userId)
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		async: true,
		schema: ChangePasswordForm.superRefine(
			async ({ currentPassword, newPassword }, ctx) => {
				if (currentPassword && newPassword) {
					const user = await verifyUserPassword({ id: userId }, currentPassword)
					if (!user) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: 'Incorrect password.',
							path: ['currentPassword'],
						})
					}
				}
			},
		),
	})

	if (submission.status !== 'success') {
		return data(
			{
				result: submission.reply({
					hideFields: ['currentPassword', 'newPassword', 'confirmNewPassword'],
				}),
			},
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}

	const { newPassword } = submission.value

	await db
		.update(password)
		.set({ hash: await getPasswordHash(newPassword) })
		.where(eq(password.userId, userId))

	return redirectWithToast(
		'/settings',
		{
			description: 'Your password has been changed.',
			title: 'Password Changed',
			type: 'success',
		},
		{ status: 302 },
	)
}

export default function ChangePasswordRoute() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		constraint: getZodConstraint(ChangePasswordForm),
		id: 'password-change-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ChangePasswordForm })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div>
			<Heading title="Change Password" type="settings" />

			<Form method="POST" {...getFormProps(form)} className="max-w-md">
				<Field
					errors={fields.currentPassword.errors}
					inputProps={getInputProps(fields.currentPassword, {
						type: 'password',
					})}
					labelProps={{ children: 'Current Password' }}
				/>
				<Field
					errors={fields.newPassword.errors}
					inputProps={getInputProps(fields.newPassword, { type: 'password' })}
					labelProps={{ children: 'New Password' }}
				/>
				<Field
					errors={fields.confirmNewPassword.errors}
					inputProps={getInputProps(fields.confirmNewPassword, {
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
						Change Password
					</StatusButton>
				</div>
			</Form>
		</div>
	)
}
