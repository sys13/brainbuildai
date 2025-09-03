import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'
import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	type MetaFunction,
	data,
	redirect,
	useActionData,
	useLoaderData,
} from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { ErrorList, Field } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/connections.js'
import { db } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { useIsPending } from '#app/utils/misc'
import { EmailSchema } from '#app/utils/user-validation'
import { prepareVerification } from './verify.server'

const SignupSchema = z.object({
	email: EmailSchema,
	whatToBuild: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const { searchParams } = new URL(request.url)

	return { whatToBuild: searchParams.get('whatToBuild') }
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	// await validateCSRF(formData, request.headers)
	await checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		async: true,
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await db.query.user.findFirst({
				columns: { id: true },
				where: {
					email: data.email,
				},
			})
			if (existingUser) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
					path: ['email'],
				})
				return
			}
		}),
	})
	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{
				status: 500,
			},
		)
	}

	const { email, whatToBuild } = submission.value
	const { otp, redirectTo, verifyUrl } = await prepareVerification({
		period: 10 * 60,
		request,
		target: email,
		type: 'onboarding',
		whatToBuild,
	})

	const response = await sendEmail({
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
		subject: 'Welcome to BrainBuild!',
		to: email,
	})

	const message = `Email: ${email}\nWhat to build: ${whatToBuild}\n\n`

	await sendEmail({
		html: message,
		subject: `NewUser: ${email} - ${message}`.slice(0, 40),
		text: message,
		to: 'contact@brainbuildai.com',
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

export function SignupEmail({
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
					<E.Text>Welcome to BrainBuild!</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link to get started:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Sign Up | BrainBuild' }]
}

export default function SignupRoute() {
	const { whatToBuild } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	// const [searchParams] = useSearchParams()
	// const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		constraint: getZodConstraint(SignupSchema),
		id: 'signup-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: SignupSchema })
			return result
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				{whatToBuild ? (
					<div>
						<div>What you want to build</div>
						<h3 className="text-h5 line-clamp-2 mb-4">{whatToBuild}</h3>
						<p className="mt-8 text-body-md text-muted-foreground">
							Please sign up so that we can save your results
						</p>
					</div>
				) : (
					<div>
						<div className="text-h1">Signup</div>
						<p className="mt-3 text-body-md text-muted-foreground">
							Let's get started with your new account
						</p>
					</div>
				)}
			</div>
			<div className="mx-auto mt-4 min-w-full max-w-sm sm:min-w-[368px]">
				<Form method="POST" {...getFormProps(form)}>
					<HoneypotInputs />
					<input name="whatToBuild" type="hidden" value={whatToBuild ?? ''} />
					<Field
						errors={fields.email.errors}
						inputProps={{
							...getInputProps(fields.email, { type: 'email' }),
							autoComplete: 'email',
							autoFocus: true,
						}}
						labelProps={{
							children: 'Email',
							htmlFor: fields.email.id,
						}}
					/>
					<ErrorList errors={form.errors} id={form.errorId} />
					<StatusButton
						className="w-full"
						disabled={isPending}
						status={isPending ? 'pending' : (form.status ?? 'idle')}
						type="submit"
					>
						Submit
					</StatusButton>
				</Form>
				<ul className="mt-5 flex flex-col gap-5 border-b-2 border-t-2 border-border py-3">
					{providerNames.map((providerName) => (
						<li key={providerName}>
							<ProviderConnectionForm
								type="Signup"
								providerName={providerName}
								// redirectTo={redirectTo}
							/>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
