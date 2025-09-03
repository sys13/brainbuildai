import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

export const honeypot = new Honeypot({
	encryptionSeed: process.env.HONEYPOT_SECRET,
	validFromFieldName: process.env.NODE_ENV === 'test' ? null : undefined,
})

export async function checkHoneypot(formData: FormData) {
	try {
		await honeypot.check(formData)
		return { isHoneypotSpam: false }
	} catch (error) {
		if (error instanceof SpamError) {
			// Return spam detection result instead of throwing
			return { isHoneypotSpam: true }
		}
		throw error
	}
}
