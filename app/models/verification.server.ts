import { and, eq } from 'drizzle-orm'
import type { VerificationTypes } from '#app/routes/_auth+/verify'
import type { twoFAVerifyVerificationType } from '#app/routes/_internal+/settings+/two-factor.verify'
import { verification } from '../../db/schema/authentication'

export function verificationFilter({
	target,
	type,
}: {
	target: string
	type: typeof twoFAVerifyVerificationType | VerificationTypes
}) {
	return and(eq(verification.type, type), eq(verification.target, target))
}
