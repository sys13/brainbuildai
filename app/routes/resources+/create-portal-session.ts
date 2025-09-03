import { invariantResponse } from '@epic-web/invariant'
import { eq } from 'drizzle-orm'
import { type ActionFunctionArgs, redirect } from 'react-router'
import stripe from 'stripe'
import { requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { getDomainUrl } from '#app/utils/misc'
import { tenant } from '#db/schema/base'

const STRIPE = new stripe(process.env.STRIPE_SECRET_KEY as string)

export async function action({ request }: ActionFunctionArgs) {
	const tenantUser = await requireAdminUser(request)
	const user = await db.query.user.findFirst({
		where: { id: tenantUser.id, tenantId: tenantUser.tenantId },
	})
	invariantResponse(user, 'User not found')

	const tenantResult = await db.query.tenant.findFirst({
		where: { id: user.tenantId },
	})
	invariantResponse(tenantResult, 'Tenant not found')

	let stripeCustomerId = tenantResult.stripeCustomerId
	if (stripeCustomerId === null) {
		const stripeCustomer = await STRIPE.customers.create({
			email: user.email,
			metadata: { userId: user.id },
			name: user.name ?? undefined,
		})
		await db
			.update(tenant)
			.set({ stripeCustomerId: stripeCustomer.id })
			.where(eq(tenant.id, user.tenantId))
		stripeCustomerId = stripeCustomer.id
	}

	// This is the url to which the customer will be redirected when they are done
	// managing their billing with the portal.
	const returnUrl = `${getDomainUrl(request)}/dashboard`

	const portalSession = await STRIPE.billingPortal.sessions.create({
		customer: stripeCustomerId,
		return_url: returnUrl,
	})

	return portalSession.url
		? redirect(portalSession.url, 303)
		: redirect('/error', 303)
}
