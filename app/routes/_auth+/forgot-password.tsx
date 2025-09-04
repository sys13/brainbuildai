import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'
import {
	type ActionFunctionArgs,
	data,
	type MetaFunction,
	redirect,
	useFetcher,
} from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { ErrorList, Field } from '#app/components/forms'
import ButtonLink from '#app/components/link-button'
import { StatusButton } from '#app/components/ui/status-button'
import { db } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { EmailSchema, UsernameSchema } from '#app/utils/user-validation'
import { prepareVerification } from './verify.server'

const ForgotPasswordSchema = z.object({
	usernameOrEmail: z.union([EmailSchema, UsernameSchema]),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	await checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		async: true,
		schema: ForgotPasswordSchema.superRefine(async (data, ctx) => {
			const userResult = await db.query.user.findFirst({
				columns: { id: true },
				where: {
					OR: [
						{ email: data.usernameOrEmail },
						{ username: data.usernameOrEmail },
					],
				},
			})

			if (!userResult) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'No user exists with this username or email',
					path: ['usernameOrEmail'],
				})
				return
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

	const { usernameOrEmail } = submission.value

	const userResult = await db.query.user.findFirst({
		columns: { email: true, username: true },
		where: { OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }] },
	})

	if (!userResult) {
		throw new Error('User not found')
	}

	const { otp, redirectTo, verifyUrl } = await prepareVerification({
		period: 10 * 60,
		request,
		target: usernameOrEmail,
		type: 'reset-password',
	})

	const response = await sendEmail({
		react: (
			<ForgotPasswordEmail onboardingUrl={verifyUrl.toString()} otp={otp} />
		),
		subject: 'BrainBuild Password Reset',
		to: userResult.email,
	})

	if (response.status === 'success') {
		return redirect(redirectTo.toString())
	}
	return data(
		{
			result: submission.reply({ formErrors: [response.error.message] }),
		},
		{
			status: 500,
		},
	)
}

function ForgotPasswordEmail({
	onboardingUrl,
	otp,
}: {
	onboardingUrl: string
	otp: string
}) {
	return (
		<E.Html dir="ltr" lang="en">
			<E.Container>
				<h1>
					<E.Text>BrainBuild Password Reset</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Password Recovery for BrainBuild' }]
}

export default function ForgotPasswordRoute() {
	const forgotPassword = useFetcher<typeof action>()

	const [form, fields] = useForm({
		constraint: getZodConstraint(ForgotPasswordSchema),
		id: 'forgot-password-form',
		lastResult: forgotPassword.data?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ForgotPasswordSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container pb-32 pt-20">
			<div className="flex flex-col justify-center">
				<div className="text-center">
					<h1 className="text-h1">Forgot Password</h1>
					<p className="mt-3 text-body-md text-muted-foreground">
						No worries, we'll send you reset instructions
					</p>
				</div>
				<div className="mx-auto mt-16 min-w-full max-w-sm sm:min-w-[368px]">
					<forgotPassword.Form method="POST" {...getFormProps(form)}>
						<HoneypotInputs />
						<div>
							<Field
								errors={fields.usernameOrEmail.errors}
								inputProps={{
									autoFocus: true,
									...getInputProps(fields.usernameOrEmail, { type: 'text' }),
								}}
								labelProps={{
									children: 'Username or Email',
									htmlFor: fields.usernameOrEmail.id,
								}}
							/>
						</div>
						<ErrorList errors={form.errors} id={form.errorId} />

						<div className="">
							<StatusButton
								className="w-full"
								disabled={forgotPassword.state !== 'idle'}
								status={
									forgotPassword.state === 'submitting'
										? 'pending'
										: (form.status ?? 'idle')
								}
								type="submit"
							>
								Recover password
							</StatusButton>
						</div>
					</forgotPassword.Form>
					<ButtonLink className="pl-0" to="/login" variant="link">
						Back to Login
					</ButtonLink>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
