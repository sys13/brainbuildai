import { invariant } from '@epic-web/invariant'
import { data, redirect } from 'react-router'
import { db } from '#app/utils/db.server'
import { verifySessionStorage } from '#app/utils/verification.server'
import { resetPasswordUsernameSessionKey } from './reset-password'
import type { VerifyFunctionArgs } from './verify.server'

export async function handleVerification({ submission }: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const target = submission.value.target
	const user = await db.query.user.findFirst({
		columns: { email: true, username: true },
		where: {
			OR: [{ email: target }, { username: target }],
		},
	})
	// we don't want to say the user is not found if the email is not found
	// because that would allow an attacker to check if an email is registered
	if (!user) {
		return data(
			{
				result: submission.reply({ fieldErrors: { code: ['Invalid code'] } }),
			},
			{
				status: 400,
			},
		)
	}

	const verifySession = await verifySessionStorage.getSession()
	verifySession.set(resetPasswordUsernameSessionKey, user.username)
	return redirect('/reset-password', {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	})
}
