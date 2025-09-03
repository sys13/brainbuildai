import * as E from '@react-email/components'
import { eq } from 'drizzle-orm'
import { data } from 'react-router'
import {
	type VerifyFunctionArgs,
	requireRecentVerification,
} from '#app/routes/_auth+/verify.server'
import { db } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { invariant } from '#app/utils/misc'
import { redirectWithToast } from '#app/utils/toast.server'
import { verifySessionStorage } from '#app/utils/verification.server'
import { user } from '#db/schema/base'

const newEmailAddressSessionKey = 'new-email-address'

export async function handleVerification({
	request,
	submission,
}: VerifyFunctionArgs) {
	await requireRecentVerification(request)
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const newEmail = verifySession.get(newEmailAddressSessionKey)
	if (!newEmail) {
		return data(
			{
				result: submission.reply({
					formErrors: [
						'You must submit the code on the same device that requested the email change.',
					],
				}),
			},
			{ status: 400 },
		)
	}

	const preUpdateUser = await db.query.user.findFirst({
		columns: { email: true },
		where: { id: submission.value.target },
	})

	if (!preUpdateUser) {
		throw new Error('User not found')
	}

	const [userResult] = await db
		.update(user)
		.set({ email: newEmail })
		.where(eq(user.id, submission.value.target))
		.returning({
			email: user.email,
			id: user.id,
			username: user.username,
		})

	void sendEmail({
		react: <EmailChangeNoticeEmail userId={userResult.id} />,
		subject: 'BrainBuild email changed',
		to: preUpdateUser.email,
	})

	return redirectWithToast(
		'/settings',
		{
			description: `Your email has been changed to ${userResult.email}`,
			title: 'Email Changed',
			type: 'success',
		},
		{
			headers: {
				'set-cookie': await verifySessionStorage.destroySession(verifySession),
			},
		},
	)
}

export function EmailChangeEmail({
	otp,
	verifyUrl,
}: {
	otp: string
	verifyUrl: string
}) {
	return (
		<E.Html dir="ltr" lang="en">
			<E.Container>
				<h1>
					<E.Text>BrainBuild Email Change</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link:</E.Text>
				</p>
				<E.Link href={verifyUrl}>{verifyUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}

export function EmailChangeNoticeEmail({ userId }: { userId: string }) {
	return (
		<E.Html dir="ltr" lang="en">
			<E.Container>
				<h1>
					<E.Text>Your BrainBuild email has been changed</E.Text>
				</h1>
				<p>
					<E.Text>
						We're writing to let you know that your BrainBuild email has been
						changed.
					</E.Text>
				</p>
				<p>
					<E.Text>
						If you changed your email address, then you can safely ignore this.
						But if you did not change your email address, then please contact
						support immediately.
					</E.Text>
				</p>
				<p>
					<E.Text>Your Account ID: {userId}</E.Text>
				</p>
			</E.Container>
		</E.Html>
	)
}
