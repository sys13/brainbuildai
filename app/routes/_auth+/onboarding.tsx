import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	useActionData,
	useLoaderData,
	useSearchParams,
} from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'
import { CheckboxField, ErrorList, Field } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import { requireAnonymous, sessionKey, signup } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { useIsPending } from '#app/utils/misc'
import { authSessionStorage } from '#app/utils/session.server'
import { redirectWithToast } from '#app/utils/toast.server'
import {
	NameSchema,
	PasswordAndConfirmPasswordSchema,
} from '#app/utils/user-validation'
import { verifySessionStorage } from '#app/utils/verification.server'

export const onboardingEmailSessionKey = 'onboardingEmail'

const SignupFormSchema = z
	.object({
		agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
			required_error:
				'You must agree to the terms of service and privacy policy',
		}),
		marketingEmails: z.boolean().optional(),
		name: NameSchema,
		redirectTo: z.string().optional(),
		remember: z.boolean().optional(),
		// username: UsernameSchema,
	})
	.and(PasswordAndConfirmPasswordSchema)

async function requireOnboardingEmail(request: Request) {
	await requireAnonymous(request)
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const email = verifySession.get(onboardingEmailSessionKey)
	if (typeof email !== 'string' || !email) {
		throw redirect('/signup')
	}

	return email
}

export async function loader({ request }: LoaderFunctionArgs) {
	const email = await requireOnboardingEmail(request)
	return { email }
}

export async function action({ request }: ActionFunctionArgs) {
	const email = await requireOnboardingEmail(request)
	const formData = await request.formData()
	// await validateCSRF(formData, request.headers)
	await checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		async: true,
		schema: (intent) =>
			SignupFormSchema.superRefine(async (_data, ctx) => {
				const existingUser = await db.query.user.findFirst({
					columns: { id: true, internal: true },
					where: { email },
				})
				if (existingUser) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this username',
						path: ['username'],
					})
					return
				}
			}).transform(async (data) => {
				if (intent !== null) {
					return { ...data, session: null }
				}

				const session = await signup({
					...data,
					email,
					username: email,
				})
				return { ...data, session }
			}),
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return data(
			{ result: submission.reply() },
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}

	const { redirectTo, remember, session } = submission.value

	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)
	const verifySession = await verifySessionStorage.getSession()
	const headers = new Headers()

	headers.append(
		'set-cookie',
		await authSessionStorage.commitSession(authSession, {
			expires: remember ? session.expirationDate : undefined,
		}),
	)
	headers.append(
		'set-cookie',
		await verifySessionStorage.destroySession(verifySession),
	)
	console.log('redirectTo', redirectTo)
	const newRedirectTo = redirectTo ?? '/dashboard'
	console.log('newRedirectTo', newRedirectTo)
	return redirectWithToast(
		safeRedirect(newRedirectTo),
		{ description: 'Thanks for signing up!', title: 'Welcome' },
		{ headers },
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Setup BrainBuild Account' }]
}

export default function SignupRoute() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		constraint: getZodConstraint(SignupFormSchema),
		defaultValue: { redirectTo: redirectTo ?? '/dashboard', remember: true },
		id: 'onboarding-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SignupFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome aboard!</h1>
					<p className="text-body-md text-muted-foreground break-all">
						{data.email}
					</p>
				</div>
				<Form
					className="mx-auto min-w-full max-w-sm sm:min-w-[368px] mt-4"
					method="POST"
					{...getFormProps(form)}
				>
					<HoneypotInputs />
					<Field
						errors={fields.name.errors}
						inputProps={{
							...getInputProps(fields.name, { type: 'text' }),
							autoComplete: 'name',
						}}
						labelProps={{ children: 'Name', htmlFor: fields.name.id }}
					/>
					<Field
						errors={fields.password.errors}
						inputProps={{
							...getInputProps(fields.password, { type: 'password' }),
							autoComplete: 'new-password',
						}}
						labelProps={{ children: 'Password', htmlFor: fields.password.id }}
					/>

					<Field
						errors={fields.confirmPassword.errors}
						inputProps={{
							...getInputProps(fields.confirmPassword, { type: 'password' }),
							autoComplete: 'new-password',
						}}
						labelProps={{
							children: 'Confirm Password',
							htmlFor: fields.confirmPassword.id,
						}}
					/>

					<CheckboxField
						buttonProps={{
							...getInputProps(fields.remember, { type: 'hidden' }),
							type: 'button',
						}}
						errors={fields.remember.errors}
						labelProps={{
							children: 'Remember me',
							htmlFor: fields.remember.id,
						}}
					/>
					<CheckboxField
						buttonProps={{
							...getInputProps(fields.agreeToTermsOfServiceAndPrivacyPolicy, {
								type: 'hidden',
							}),
							type: 'button',
						}}
						errors={fields.agreeToTermsOfServiceAndPrivacyPolicy.errors}
						labelProps={{
							children:
								'Do you agree to our Terms of Service and Privacy Policy?',
							htmlFor: fields.agreeToTermsOfServiceAndPrivacyPolicy.id,
						}}
					/>
					<CheckboxField
						buttonProps={{
							...getInputProps(fields.marketingEmails, { type: 'hidden' }),
							type: 'button',
						}}
						errors={fields.marketingEmails.errors}
						labelProps={{
							children: 'Do you want occasional product updates from us?',
							htmlFor: fields.marketingEmails.id,
						}}
					/>

					<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />
					<ErrorList errors={form.errors} id={form.errorId} />

					<div className="flex items-center justify-between gap-6">
						<StatusButton
							className="w-full"
							disabled={isPending}
							status={isPending ? 'pending' : (form.status ?? 'idle')}
							type="submit"
						>
							Create an account
						</StatusButton>
					</div>
				</Form>
			</div>
		</div>
	)
}
