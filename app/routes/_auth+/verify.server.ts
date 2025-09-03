import type { Submission } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { data } from 'react-router'
import { z } from 'zod'
import { createTenant } from '#app/models/tenant.server'
import { verificationFilter } from '#app/models/verification.server'
import { handleVerification as handleChangeEmailVerification } from '#app/routes/_internal+/settings+/profile.change-email.server'
import { requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { getDomainUrl } from '#app/utils/misc'
import { redirectWithToast } from '#app/utils/toast.server'
import { generateTOTP, verifyTOTP } from '#app/utils/totp.server'
import type { Tier } from '#app/utils/types'
import { verification } from '../../../db/schema/authentication'
import { twoFAVerificationType } from '../_internal+/settings+/two-factor'
import type { twoFAVerifyVerificationType } from '../_internal+/settings+/two-factor.verify'
import {
	handleVerification as handleLoginTwoFactorVerification,
	shouldRequestTwoFA,
} from './login.server'
import { handleVerification as handleOnboardingVerification } from './onboarding.server'
import { handleVerification as handleResetPasswordVerification } from './reset-password.server'
import {
	type VerificationTypes,
	VerifySchema,
	codeQueryParam,
	redirectToQueryParam,
	targetQueryParam,
	typeQueryParam,
} from './verify'

export interface VerifyFunctionArgs {
	body: FormData | URLSearchParams
	request: Request
	submission: Submission<
		z.input<typeof VerifySchema>,
		string[],
		z.output<typeof VerifySchema>
	>
}

export function getRedirectToUrl({
	redirectTo,
	request,
	target,
	type,
}: {
	redirectTo?: string
	request: Request
	target: string
	type: VerificationTypes
}) {
	const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`)
	redirectToUrl.searchParams.set(typeQueryParam, type)
	redirectToUrl.searchParams.set(targetQueryParam, target)
	if (redirectTo) {
		redirectToUrl.searchParams.set(redirectToQueryParam, redirectTo)
	}

	return redirectToUrl
}

export async function requireRecentVerification(request: Request) {
	const { id: userId } = await requireUser(request)
	const shouldReverify = await shouldRequestTwoFA(request)
	if (shouldReverify) {
		const reqUrl = new URL(request.url)
		const redirectUrl = getRedirectToUrl({
			redirectTo: reqUrl.pathname + reqUrl.search,
			request,
			target: userId,
			type: twoFAVerificationType,
		})
		throw await redirectWithToast(redirectUrl.toString(), {
			description: 'Please reverify your account before proceeding',
			title: 'Please Reverify',
		})
	}
}

export async function prepareVerification({
	period,
	request,
	stripeCustomerId,
	target,
	tier,
	type,
	whatToBuild,
}: {
	period: number
	request: Request
	stripeCustomerId?: string
	target: string
	tier?: Tier
	type: VerificationTypes
	whatToBuild?: string
}) {
	const verifyUrl = getRedirectToUrl({ request, target, type })
	const redirectTo = new URL(verifyUrl.toString())

	const { otp, ...verificationConfig } = await generateTOTP({
		algorithm: 'SHA-256',
		charSet: '123456789',
		period,
	})

	const baseVerificationData = {
		target,
		type,
		...verificationConfig,
		expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
	}

	const tenantId = await createTenant({
		completedOnboarding: false,
		initialEmail: target,
		stripeCustomerId,
		tier,
		whatToBuild,
	})

	const verificationData = {
		...baseVerificationData,
		internal: true,
		tenantId,
		whatToBuild,
	}

	// if it isn't, then create a tenant and add the verification to the tenant

	await db
		.insert(verification)
		.values(verificationData)
		.onConflictDoUpdate({
			set: verificationData,
			target: [verification.target, verification.type],
			where: verificationFilter(verificationData),
		})

	// add the otp to the url we'll email the user.
	verifyUrl.searchParams.set(codeQueryParam, otp)

	return { otp, redirectTo, verifyUrl }
}

export async function isCodeValid({
	code,
	target,
	type,
}: {
	code: string
	target: string
	type: typeof twoFAVerifyVerificationType | VerificationTypes
}) {
	const verificationResult = await db.query.verification.findFirst({
		columns: { algorithm: true, charSet: true, period: true, secret: true },
		where: {
			target,
			type,
			OR: [{ expiresAt: { isNull: true } }, { expiresAt: { gt: new Date() } }],
		},
	})

	if (!verificationResult) {
		return false
	}
	const result = await verifyTOTP({
		otp: code,
		...verificationResult,
	})

	if (!result) {
		return false
	}

	return true
}

export async function validateRequest(
	request: Request,
	body: FormData | URLSearchParams,
) {
	const submission = await parseWithZod(body, {
		async: true,
		schema: VerifySchema.superRefine(async (data, ctx) => {
			const codeIsValid = await isCodeValid({
				code: data[codeQueryParam],
				target: data[targetQueryParam],
				type: data[typeQueryParam],
			})
			if (!codeIsValid) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid code',
					path: ['code'],
				})
				return
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

	// this code path could be part of a loader (GET request), so we need to make
	// sure we're running on primary because we're about to make writes.

	const { value: submissionValue } = submission

	async function deleteVerification() {
		await db.delete(verification).where(
			verificationFilter({
				target: submissionValue[targetQueryParam],
				type: submissionValue[typeQueryParam],
			}),
		)
	}

	switch (submissionValue[typeQueryParam]) {
		case '2fa': {
			return handleLoginTwoFactorVerification({ body, request, submission })
		}

		case 'change-email': {
			await deleteVerification()
			return handleChangeEmailVerification({ body, request, submission })
		}

		case 'onboarding': {
			await deleteVerification()
			return handleOnboardingVerification({ body, request, submission })
		}

		case 'reset-password': {
			await deleteVerification()
			return handleResetPasswordVerification({ body, request, submission })
		}
	}
}
