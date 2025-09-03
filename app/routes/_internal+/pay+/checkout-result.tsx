import { invariantResponse } from '@epic-web/invariant'
import { eq } from 'drizzle-orm'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import stripe from 'stripe'
import { z } from 'zod'
import { SignupEmail } from '#app/routes/_auth+/signup'
import { prepareVerification } from '#app/routes/_auth+/verify.server'
import { getUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { booleanFromStringSchema } from '#app/utils/ts-utils'
import { tenant } from '#db/schema/base'

const STRIPE = new stripe(process.env.STRIPE_SECRET_KEY as string)

const schema = z.object({
	session_id: z.string(),
	success: booleanFromStringSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
	const { session_id: sessionId, success } = schema.parse(
		Object.fromEntries(new URL(request.url).searchParams.entries()),
	)
	if (!success) {
		return redirect('/pricing')
	}
	invariantResponse(sessionId, 'No session id')

	const session = await STRIPE.checkout.sessions.retrieve(sessionId)
	const tenantUser = await getUser(request)
	if (tenantUser) {
		const user = await db.query.user.findFirst({
			where: { id: tenantUser.id, tenantId: tenantUser.tenantId },
		})
		invariantResponse(user, 'User not found')
		const stripeCustomerId = session.customer as string
		await db
			.update(tenant)
			.set({ stripeCustomerId, tier: 'pro' })
			.where(eq(tenant.id, user.tenantId))
		return redirect('/dashboard')
	}
	const email = session.customer_details?.email as string

	const { otp, verifyUrl } = await prepareVerification({
		period: 10 * 60,
		request,
		stripeCustomerId: session.customer as string,
		target: email,
		tier: 'pro',
		type: 'onboarding',
	})

	await sendEmail({
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
		subject: 'Welcome to BrainBuild!',
		to: email,
	})
	return redirect(`/verify?type=onboarding&target=${email}`)
}
