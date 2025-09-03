import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	type MetaFunction,
	useFetcher,
} from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { ErrorList, Field, TextareaField } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import { requireAnonymous } from '#app/utils/auth.server'
import { sendEmail } from '#app/utils/email.server'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { detectSpam } from '#app/utils/spam-detection.server'

const ContactSchema = z.object({
	email: z.string().min(1),
	message: z.string().min(1),
})

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request)
	const formData = await request.formData()
	const honeypotResult = await checkHoneypot(formData)
	const submission = parseWithZod(formData, { schema: ContactSchema })

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { email, message } = submission.value

	// If honeypot detected spam, silently reject
	if (honeypotResult.isHoneypotSpam) {
		return { status: 'success', submission } as const
	}

	// Check for spam using AI
	const spamDetection = await detectSpam({ email, message })

	if (spamDetection.isSpam && spamDetection.confidence > 0.7) {
		// Silently reject spam - don't send email but show success to user
		// This prevents spammers from knowing their message was blocked
		return { status: 'success', submission } as const
	}

	sendEmail({
		html: message,
		subject: `CR: ${email} - ${message}`.slice(0, 40),
		text: message,
		to: 'contact@brainbuildai.com',
	})

	return { status: 'success', submission } as const
}

export const meta: MetaFunction = () => {
	return [{ title: 'Contact Us' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export default function Contact() {
	const fetcher = useFetcher<typeof action>()
	const [form, fields] = useForm({
		constraint: getZodConstraint(ContactSchema),
		id: 'login-form',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ContactSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	return (
		<div className="mx-4 mt-8 flex justify-center">
			<div className="max-w-md ">
				<h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-secondary-foreground sm:text-4xl ">
					Contact Us
				</h2>
				<p className="mx-auto mt-2 max-w-xl text-center text-lg text-muted-foreground">
					Feel free to send us a message for questions, feedback, or requests
					for a demo
				</p>
				{fetcher.data?.status === 'success' && (
					<div className="p-4 my-4 text-center bg-green-100 border border-green-200 rounded-md">
						<p className="text-green-800">
							Your message has been sent! We will get back to you as soon as
							possible. Thank you.
						</p>
					</div>
				)}
				<div className="mt-4">
					<fetcher.Form method="POST" {...getFormProps(form)}>
						<HoneypotInputs />
						<TextareaField
							errors={fields.message.errors}
							labelProps={{ children: 'Message' }}
							textareaProps={{
								...getInputProps(fields.message, { type: 'text' }),
								autoComplete: 'off',
								placeholder: 'Your message',
							}}
						/>

						<Field
							errors={fields.email.errors}
							inputProps={{
								placeholder: 'Email address',
								...getInputProps(fields.email, {
									type: 'email',
								}),
								autoComplete: 'email',
							}}
							labelProps={{ children: 'Your Email' }}
						/>

						<ErrorList errors={form.errors} id={form.errorId} />

						<StatusButton
							className="w-full"
							status={
								fetcher.state !== 'idle' ? 'pending' : (form.status ?? 'idle')
							}
							type="submit"
						>
							Send message
						</StatusButton>
					</fetcher.Form>
				</div>
			</div>
		</div>
	)
}
