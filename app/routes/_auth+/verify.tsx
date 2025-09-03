import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { Form, useActionData, useSearchParams } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { ErrorList, OTPField } from '#app/components/forms'
import { Spacer } from '#app/components/spacer'
import { StatusButton } from '#app/components/ui/status-button'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { useIsPending } from '#app/utils/misc'
import { validateRequest } from './verify.server'

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'
const types = ['onboarding', 'reset-password', 'change-email', '2fa'] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

export const VerifySchema = z.object({
	[codeQueryParam]: z.string().min(6).max(6),
	[redirectToQueryParam]: z.string().optional(),
	[targetQueryParam]: z.string(),
	[typeQueryParam]: VerificationTypeSchema,
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	await checkHoneypot(formData)
	// await validateCSRF(formData, request.headers)
	return validateRequest(request, formData)
}

export default function VerifyRoute() {
	const [searchParams] = useSearchParams()
	const isPending = useIsPending()
	const actionData = useActionData<typeof action>()
	const parseWithZodType = VerificationTypeSchema.safeParse(
		searchParams.get(typeQueryParam),
	)
	const type = parseWithZodType.success ? parseWithZodType.data : null

	const checkEmail = (
		<>
			<h1 className="text-h1">Check your email</h1>
			<p className="mt-3 text-body-md text-muted-foreground">
				We've sent you a code to verify your email address.
			</p>
		</>
	)

	const headings: Record<VerificationTypes, React.ReactNode> = {
		'2fa': (
			<>
				<h1 className="text-h1">Check your 2FA app</h1>
				<p className="mt-3 text-body-md text-muted-foreground">
					Please enter your 2FA code to verify your identity.
				</p>
			</>
		),
		'change-email': checkEmail,
		onboarding: checkEmail,
		'reset-password': checkEmail,
	}

	const [form, fields] = useForm({
		constraint: getZodConstraint(VerifySchema),
		defaultValue: {
			code: searchParams.get(codeQueryParam),
			redirectTo: searchParams.get(redirectToQueryParam),
			target: searchParams.get(targetQueryParam),
			type,
		},
		id: 'verify-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema })
		},
	})

	return (
		<main className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				{type ? headings[type] : 'Invalid Verification Type'}
			</div>

			<Spacer size="xs" />

			<div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
				<div>
					<ErrorList errors={form.errors} id={form.errorId} />
				</div>
				<div className="flex w-full gap-2">
					<Form method="POST" {...getFormProps(form)} className="flex-1">
						<HoneypotInputs />
						<div className="flex items-center justify-center">
							<OTPField
								errors={fields[codeQueryParam].errors}
								inputProps={{
									...getInputProps(fields[codeQueryParam], { type: 'text' }),
									autoComplete: 'one-time-code',
									autoFocus: true,
								}}
								labelProps={{
									children: 'Code',
									htmlFor: fields[codeQueryParam].id,
								}}
							/>
						</div>
						<input
							{...getInputProps(fields[typeQueryParam], { type: 'hidden' })}
						/>
						<input
							{...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
						/>
						<input
							{...getInputProps(fields[redirectToQueryParam], {
								type: 'hidden',
							})}
						/>
						<StatusButton
							className="w-full"
							disabled={isPending}
							status={isPending ? 'pending' : (form.status ?? 'idle')}
							type="submit"
						>
							Submit
						</StatusButton>
					</Form>
				</div>
			</div>
		</main>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
