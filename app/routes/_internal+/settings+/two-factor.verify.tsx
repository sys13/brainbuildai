import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import * as QRCode from 'qrcode'
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
} from 'react-router'
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import { isCodeValid } from '#app/routes/_auth+/verify.server'
import { requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { getDomainUrl, useIsPending } from '#app/utils/misc'
import { redirectWithToast } from '#app/utils/toast.server'
import { getTOTPAuthUri } from '#app/utils/totp.server'
import { verification } from '#db/schema/authentication'
import { twoFAVerificationType } from './two-factor'

const CancelSchema = z.object({ intent: z.literal('cancel') })
const VerifySchema = z.object({
	code: z.string().min(6).max(6),
	intent: z.literal('verify'),
})

const ActionSchema = z.discriminatedUnion('intent', [
	CancelSchema,
	VerifySchema,
])

export const twoFAVerifyVerificationType = '2fa-verify'

export async function loader({ request }: LoaderFunctionArgs) {
	const { id: userId } = await requireUser(request)
	const verification = await db.query.verification.findFirst({
		columns: {
			algorithm: true,
			digits: true,
			id: true,
			period: true,
			secret: true,
		},
		where: { type: twoFAVerifyVerificationType, target: userId },
	})
	if (!verification) {
		return redirect('/settings/two-factor')
	}

	const userResult = await db.query.user.findFirst({
		columns: { email: true },
		where: { id: userId },
	})

	if (!userResult) {
		throw new Error('User not found')
	}
	const issuer = new URL(getDomainUrl(request)).host
	const otpUri = getTOTPAuthUri({
		...verification,
		accountName: userResult.email,
		issuer,
	})
	const qrCode = await QRCode.toDataURL(otpUri)
	return { otpUri, qrCode }
}

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId } = await requireUser(request)
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		async: true,
		schema: () =>
			ActionSchema.superRefine(async (data, ctx) => {
				if (data.intent === 'cancel') {
					return null
				}
				const codeIsValid = await isCodeValid({
					code: data.code,
					target: userId,
					type: twoFAVerifyVerificationType,
				})
				if (!codeIsValid) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Invalid code',
						path: ['code'],
					})
					return z.NEVER
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

	switch (submission.value.intent) {
		case 'cancel': {
			await db
				.delete(verification)
				.where(
					and(
						eq(verification.type, twoFAVerifyVerificationType),
						eq(verification.target, userId),
					),
				)
			return redirect('/settings/two-factor')
		}

		case 'verify': {
			await db
				.update(verification)
				.set({ type: twoFAVerificationType })
				.where(
					and(
						eq(verification.type, twoFAVerifyVerificationType),
						eq(verification.target, userId),
					),
				)
			return redirectWithToast('/settings/two-factor', {
				description: 'Two-factor authentication has been enabled.',
				title: 'Enabled',
				type: 'success',
			})
		}
	}
}

export default function TwoFactorRoute() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()

	const isPending = useIsPending()
	const pendingIntent = isPending ? navigation.formData?.get('intent') : null

	const [form, fields] = useForm({
		constraint: getZodConstraint(ActionSchema),
		id: 'verify-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ActionSchema })
		},
	})

	const lastSubmissionIntent = fields.intent.value

	return (
		<div>
			<div className="flex flex-col items-center gap-4">
				<img alt="qr code" className="size-56" src={data.qrCode} />
				<p>Scan this QR code with your authenticator app.</p>
				<p className="text-sm">
					If you cannot scan the QR code, you can manually add this account to
					your authenticator app using this code:
				</p>
				<div className="p-3">
					<pre
						aria-label="One-time Password URI"
						className="whitespace-pre-wrap break-all text-sm"
					>
						{data.otpUri}
					</pre>
				</div>
				<p className="text-sm">
					Once you've added the account, enter the code from your authenticator
					app below. Once you enable 2FA, you will need to enter a code from
					your authenticator app every time you log in or perform important
					actions. Do not lose access to your authenticator app, or you will
					lose access to your account.
				</p>
				<div className="flex w-full max-w-xs flex-col justify-center gap-4">
					<Form method="POST" {...getFormProps(form)} className="flex-1">
						<Field
							errors={fields.code.errors}
							inputProps={{
								...getInputProps(fields.code, { type: 'text' }),
								autoFocus: true,
							}}
							labelProps={{
								children: 'Code',
								htmlFor: fields.code.id,
							}}
						/>

						<div className="min-h-[32px] px-4 pb-3 pt-1">
							<ErrorList errors={form.errors} id={form.errorId} />
						</div>

						<div className="flex justify-between gap-4">
							<StatusButton
								className="w-full"
								name="intent"
								status={
									pendingIntent === 'verify'
										? 'pending'
										: lastSubmissionIntent === 'verify'
											? (form.status ?? 'idle')
											: 'idle'
								}
								type="submit"
								value="verify"
							>
								Submit
							</StatusButton>
							<StatusButton
								className="w-full"
								disabled={isPending}
								name="intent"
								status={
									pendingIntent === 'cancel'
										? 'pending'
										: lastSubmissionIntent === 'cancel'
											? (form.status ?? 'idle')
											: 'idle'
								}
								type="submit"
								value="cancel"
								variant="secondary"
							>
								Cancel
							</StatusButton>
						</div>
					</Form>
				</div>
			</div>
		</div>
	)
}
