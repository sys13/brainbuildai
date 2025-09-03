import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { type ActionFunctionArgs, redirect } from 'react-router'
import stripe from 'stripe'
import { z } from 'zod'
import { getUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { getDomainUrl } from '#app/utils/misc'

const STRIPE = new stripe(process.env.STRIPE_SECRET_KEY as string)
const schema = z.object({ priceId: z.string() })

export async function action({ request }: ActionFunctionArgs) {
	const tenantUser = await getUser(request)
	let stripeCustomerId: string | undefined
	if (tenantUser) {
		const user = await db.query.user.findFirst({
			where: { id: tenantUser.id, tenantId: tenantUser.tenantId },
			with: { tenant: true },
		})
		invariantResponse(user, 'User not found')
		const stripeCustomerIdFromDB = user.tenant.stripeCustomerId
		stripeCustomerId = user.tenant.stripeCustomerId ?? undefined
		if (stripeCustomerIdFromDB === null) {
			const stripeCustomer = await STRIPE.customers.create({
				email: user.email,
				metadata: { userId: user.id },
				name: user.name ?? undefined,
			})
			stripeCustomerId = stripeCustomer.id
		}
	}
	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema })
	invariantResponse(submission.status === 'success', 'Invalid form data')
	const { priceId } = submission.value

	const domainURL = getDomainUrl(request)

	const session = await STRIPE.checkout.sessions.create({
		billing_address_collection: 'auto',
		// consent_collection: 'auto',
		cancel_url: `${domainURL}/pricing`,
		customer: stripeCustomerId,
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: 'subscription',
		success_url: `${domainURL}/pay/checkout-result?success=true&session_id={CHECKOUT_SESSION_ID}`,
	})

	return session.url ? redirect(session.url, 303) : redirect('/error', 303)
}
