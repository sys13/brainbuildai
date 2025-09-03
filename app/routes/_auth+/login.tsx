import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	Form,
	Link,
	type LoaderFunctionArgs,
	type MetaFunction,
	data,
	useActionData,
	useSearchParams,
} from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { CheckboxField, ErrorList, Field } from '#app/components/forms'
import { Spacer } from '#app/components/spacer'
import { StatusButton } from '#app/components/ui/status-button'
import { login, requireAnonymous } from '#app/utils/auth.server'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/connections.js'
import { db } from '#app/utils/db.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { useIsPending } from '#app/utils/misc'
import { PasswordSchema } from '#app/utils/user-validation'
import { handleNewSession } from './login.server'

const LoginFormSchema = z.object({
	password: PasswordSchema,
	redirectTo: z.string().optional(),
	remember: z.boolean().optional(),
	username: z.string(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)
	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request)
	const formData = await request.formData()
	await checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		async: true,
		schema: (intent) =>
			LoginFormSchema.transform(async (data, ctx) => {
				if (intent !== null) {
					return { ...data, session: null }
				}
				const session = await login(data)
				if (!session) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Invalid email or password',
					})
					return z.NEVER
				}

				const internal = await isInternalUser(session.userId)

				return { ...data, internal, session }
			}),
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return data(
			{
				result: submission.reply({
					hideFields: ['password'],
				}),
			},
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}

	const { internal, redirectTo, remember, session } = submission.value

	const newRedirectTo = redirectTo ?? (internal ? '/dashboard' : '/app')
	console.log('newRedirectTo', newRedirectTo)
	return handleNewSession({
		redirectTo: newRedirectTo,
		remember: remember ?? false,
		request,
		session,
	})
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		constraint: getZodConstraint(LoginFormSchema),
		defaultValue: { redirectTo },
		id: 'login-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-md">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome back!</h1>
					<p className="text-body-md text-muted-foreground">
						Please login here
					</p>
				</div>
				<Spacer size="xs" />

				<div>
					<div className="mx-auto w-full max-w-md px-8">
						<Form method="POST" {...getFormProps(form)}>
							<HoneypotInputs />
							<Field
								errors={fields.username.errors}
								inputProps={{
									...getInputProps(fields.username, { type: 'email' }),
									autoFocus: true,
									className: 'lowercase',
								}}
								labelProps={{ children: 'Email' }}
							/>

							<Field
								errors={fields.password.errors}
								inputProps={getInputProps(fields.password, {
									type: 'password',
								})}
								labelProps={{ children: 'Password' }}
							/>

							<div className="flex justify-between">
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
								<div>
									<Link
										className="text-body-xs font-semibold"
										to="/forgot-password"
									>
										Forgot password?
									</Link>
								</div>
							</div>

							<input
								{...getInputProps(fields.redirectTo, { type: 'hidden' })}
							/>
							<ErrorList errors={form.errors} id={form.errorId} />

							<div className="flex items-center justify-between gap-6 pt-3">
								<StatusButton
									className="w-full"
									disabled={isPending}
									status={isPending ? 'pending' : (form.status ?? 'idle')}
									type="submit"
								>
									Log in
								</StatusButton>
							</div>
						</Form>
						<ul className="mt-5 flex flex-col gap-5 border-b-2 border-t-2 border-border py-3">
							{providerNames.map((providerName) => (
								<li key={providerName}>
									<ProviderConnectionForm
										type="Login"
										providerName={providerName}
										redirectTo={redirectTo}
									/>
								</li>
							))}
						</ul>
						<div className="flex items-center justify-center gap-2 pt-6">
							<span className="text-muted-foreground">New here?</span>
							<Link
								to={
									redirectTo
										? `/signup?${encodeURIComponent(redirectTo)}`
										: '/signup'
								}
							>
								Create an account
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Login to BrainBuild' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

async function isInternalUser(userId: string): Promise<boolean> {
	const user = await db.query.user.findFirst({
		columns: { internal: true },
		where: { id: userId },
	})

	return !!user?.internal
}
