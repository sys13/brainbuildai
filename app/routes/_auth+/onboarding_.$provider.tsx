import {
	getFormProps,
	getInputProps,
	type SubmissionResult,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	type MetaFunction,
	type Params,
	redirect,
	useActionData,
	useLoaderData,
	useSearchParams,
} from 'react-router'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'
import { CheckboxField, ErrorList, Field } from '#app/components/forms'
import { Spacer } from '#app/components/spacer'
import { StatusButton } from '#app/components/ui/status-button'
import {
	requireAnonymous,
	sessionKey,
	signupWithConnection,
} from '#app/utils/auth.server'
import { ProviderNameSchema } from '#app/utils/connections'
import { db } from '#app/utils/db.server'
import { useIsPending } from '#app/utils/misc'
import { authSessionStorage } from '#app/utils/session.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { NameSchema, UsernameSchema } from '#app/utils/user-validation'
import { verifySessionStorage } from '#app/utils/verification.server'
import { onboardingEmailSessionKey } from './onboarding'

export const providerIdKey = 'providerId'
export const prefilledProfileKey = 'prefilledProfile'

const SignupFormSchema = z.object({
	agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
		message: 'You must agree to the terms of service and privacy policy',
	}),
	imageUrl: z.string().optional(),
	name: NameSchema,
	redirectTo: z.string().optional(),
	remember: z.boolean().optional(),
	username: UsernameSchema,
})

async function requireData({
	params,
	request,
}: {
	params: Params
	request: Request
}) {
	await requireAnonymous(request)
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const email = verifySession.get(onboardingEmailSessionKey)
	const providerId = verifySession.get(providerIdKey)
	const result = z
		.object({
			email: z.string(),
			providerId: z.string().or(z.number()),
			providerName: ProviderNameSchema,
		})
		.safeParse({ email, providerId, providerName: params.provider })
	if (result.success) {
		return result.data
	}
	console.error(result.error)
	throw redirect('/signup')
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { email } = await requireData({ params, request })

	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const prefilledProfile = verifySession.get(prefilledProfileKey)

	return {
		email,
		status: 'idle',
		submission: {
			initialValue: prefilledProfile ?? {},
		} as SubmissionResult,
	}
}

export async function action({ params, request }: ActionFunctionArgs) {
	const {
		email,
		// providerId,
		// providerName,
	} = await requireData({
		params,
		request,
	})
	const formData = await request.formData()
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)

	const submission = await parseWithZod(formData, {
		async: true,
		schema: SignupFormSchema.superRefine(async (data, ctx) => {
			const existingUser = await db.query.user.findFirst({
				columns: { id: true },
				where: { username: data.username },
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
			const session = await signupWithConnection({
				...data,
				email,
				// providerId,
				// providerName,
			})
			return { ...data, session }
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

	const { redirectTo, remember, session } = submission.value

	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)
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

	return redirectWithToast(
		safeRedirect(redirectTo),
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
		id: 'onboarding-provider-form',
		lastResult: actionData?.result ?? data.submission,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SignupFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome aboard {data.email}!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details to complete your account setup
					</p>
				</div>
				<Spacer size="xs" />
				<Form
					className="mx-auto min-w-full max-w-sm sm:min-w-[368px]"
					method="POST"
					{...getFormProps(form)}
				>
					{fields.imageUrl.initialValue ? (
						<div className="mb-4 flex flex-col items-center justify-center gap-4">
							<img
								alt="Profile"
								className="size-24 rounded-full"
								src={fields.imageUrl.initialValue}
							/>
							<p className="text-body-sm text-muted-foreground">
								You can change your photo later
							</p>
							<input {...getInputProps(fields.imageUrl, { type: 'hidden' })} />
						</div>
					) : null}
					<Field
						errors={fields.username.errors}
						inputProps={{
							...getInputProps(fields.username, { type: 'text' }),
							autoComplete: 'username',
							className: 'lowercase',
						}}
						labelProps={{ children: 'Username', htmlFor: fields.username.id }}
					/>
					<Field
						errors={fields.name.errors}
						inputProps={{
							...getInputProps(fields.name, { type: 'text' }),
							autoComplete: 'name',
						}}
						labelProps={{ children: 'Name', htmlFor: fields.name.id }}
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
							...getInputProps(fields.remember, { type: 'hidden' }),
							type: 'button',
						}}
						errors={fields.remember.errors}
						labelProps={{
							children: 'Remember me',
							htmlFor: fields.remember.id,
						}}
					/>

					{redirectTo ? (
						<input name="redirectTo" type="hidden" value={redirectTo} />
					) : null}

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
