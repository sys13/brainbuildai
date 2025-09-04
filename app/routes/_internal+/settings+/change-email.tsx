import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
} from 'react-router'
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms'
import { Heading } from '#app/components/heading'
import { StatusButton } from '#app/components/ui/status-button'
import {
	prepareVerification,
	requireRecentVerification,
} from '#app/routes/_auth+/verify.server'
import { requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { useIsPending } from '#app/utils/misc'
import { EmailSchema } from '#app/utils/user-validation'
import { verifySessionStorage } from '#app/utils/verification.server'
import { EmailChangeEmail } from './profile.change-email.server'

const newEmailAddressSessionKey = 'new-email-address'

const ChangeEmailSchema = z.object({
	email: EmailSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
	await requireRecentVerification(request)
	const { id: userId } = await requireUser(request)
	const userResult = await db.query.user.findFirst({
		columns: { email: true },
		where: { id: userId },
	})
	if (!userResult) {
		const params = new URLSearchParams({ redirectTo: request.url })
		throw redirect(`/login?${params}`)
	}

	return { user: userResult }
}

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId } = await requireUser(request)
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		async: true,
		schema: ChangeEmailSchema.superRefine(async (data, ctx) => {
			const existingUser = await db.query.user.findFirst({
				where: { email: data.email },
			})
			if (existingUser) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'This email is already in use.',
					path: ['email'],
				})
			}
		}),
	})

	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}

	const { otp, redirectTo, verifyUrl } = await prepareVerification({
		period: 10 * 60,
		request,
		target: userId,
		type: 'change-email',
	})

	const response = await sendEmail({
		react: <EmailChangeEmail otp={otp} verifyUrl={verifyUrl.toString()} />,
		subject: 'BrainBuild Email Change Verification',
		to: submission.value.email,
	})

	if (response.status === 'success') {
		const verifySession = await verifySessionStorage.getSession()
		verifySession.set(newEmailAddressSessionKey, submission.value.email)
		return redirect(redirectTo.toString(), {
			headers: {
				'set-cookie': await verifySessionStorage.commitSession(verifySession),
			},
		})
	}
	return data(
		{ result: submission.reply({ formErrors: [response.error.message] }) },
		{ status: 500 },
	)
}

export default function ChangeEmailIndex() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		constraint: getZodConstraint(ChangeEmailSchema),
		id: 'change-email-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ChangeEmailSchema })
		},
	})

	const isPending = useIsPending()
	return (
		<div>
			<Heading title="Change Email" type="settings" />
			<p>You will receive an email at the new email address to confirm.</p>
			<p>
				An email notice will also be sent to your old address {data.user.email}.
			</p>
			<div className="mt-4">
				<Form method="POST" {...getFormProps(form)}>
					<Field
						errors={fields.email.errors}
						inputProps={getInputProps(fields.email, { type: 'email' })}
						labelProps={{ children: 'New Email' }}
					/>
					<ErrorList errors={form.errors} id={form.errorId} />
					<div>
						<StatusButton
							status={isPending ? 'pending' : (form.status ?? 'idle')}
						>
							Send Confirmation
						</StatusButton>
					</div>
				</Form>
			</div>
		</div>
	)
}
