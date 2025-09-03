import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function addEmailToAudience(email: string) {
	return await resend.contacts.create({
		audienceId: '506a4e7e-3b31-406e-999a-a17c8817170e',
		email,
		unsubscribed: false,
	})
}
