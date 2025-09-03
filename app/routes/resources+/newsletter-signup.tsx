import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { useFetcher } from 'react-router'
import { z } from 'zod'
import { Field } from '#app/components/forms'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { StatusButton } from '#app/components/ui/status-button'
import { addEmailToAudience } from '#app/utils/audience-email.server'
import { useIsPending } from '#app/utils/misc'

const schema = z.object({
	email: z.string().email(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = parseWithZod(formData, { schema })

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { email } = submission.value

	await addEmailToAudience(email)

	return { status: 'success', submission } as const
}

export default function NewsletterSignup({
	className,
}: {
	className?: string
}) {
	const fetcher = useFetcher<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'login-form',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		shouldRevalidate: 'onBlur',
	})
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Newsletter Signup</CardTitle>
				<CardDescription>
					Sign up for our newsletter to get the latest updates
				</CardDescription>
			</CardHeader>

			<fetcher.Form
				action="/resources/newsletter-signup"
				method="POST"
				{...getFormProps(form)}
			>
				<CardContent>
					<Field
						className=""
						errors={fields.email.errors}
						inputProps={{
							placeholder: 'Email address',
							...getInputProps(fields.email, {
								type: 'email',
							}),
							autoComplete: 'email',
						}}
						labelProps={{ children: 'Your Email' }}
						noErrorMin
					/>
					{fetcher.data?.status === 'success'
						? 'Newsletter signup successful!'
						: null}
				</CardContent>
				<CardFooter className="flex justify-end">
					<StatusButton
						className=""
						disabled={isPending}
						status={
							fetcher.state !== 'idle' ? 'pending' : (form.status ?? 'idle')
						}
						type="submit"
					>
						Submit
					</StatusButton>
				</CardFooter>
			</fetcher.Form>
		</Card>
	)
}
