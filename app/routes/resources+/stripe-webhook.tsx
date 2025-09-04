import { db } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { tenant } from '#db/schema/base'
import { invariantResponse } from '@epic-web/invariant'
import { eq } from 'drizzle-orm'
import type { ActionFunctionArgs } from 'react-router'
import stripe from 'stripe'

const STRIPE = new stripe(process.env.STRIPE_SECRET_KEY as string)
const INFO_EMAIL_ADDRESS = 'daniel@brainbuildai.com'

export async function action({ request }: ActionFunctionArgs) {
	// Replace this endpoint secret with your endpoint's unique secret
	// If you are testing with the CLI, find the secret by running 'stripe listen'
	// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
	// at https://dashboard.stripe.com/webhooks
	const endpointSecret = process.env.STRIPE_ENDPOINT_KEY ?? ''

	// Only verify the event if you have an endpoint secret defined.
	// Otherwise use the basic event deserialized with JSON.parse
	const buffer = await streamToBuffer(request.body)

	// Get the signature sent by Stripe
	const signature = request.headers.get('stripe-signature')
	invariantResponse(signature, 'No signature')
	const event = STRIPE.webhooks.constructEvent(
		buffer,
		signature,
		endpointSecret,
	)

	// biome-ignore lint/suspicious/noImplicitAnyLet: misc
	let subscription

	// let status
	// Handle the event
	switch (event.type) {
		case 'customer.subscription.created':
			subscription = event.data.object

			await sendEmail({
				react: (
					<div>
						<p>A subscription was created</p>
						<code>{JSON.stringify(subscription.customer, null, 2)}</code>
						<p>
							<a href="https://dashboard.stripe.com/subscriptions">
								Link to stripe dashboard
							</a>
						</p>
					</div>
				),
				subject: 'Subscription created',
				to: INFO_EMAIL_ADDRESS,
			})
			// Then define and call a method to handle the subscription created.
			// handleSubscriptionCreated(subscription);
			break
		case 'customer.subscription.deleted': {
			subscription = event.data.object

			const stripeCustomerId = subscription.customer
			invariantResponse(
				typeof stripeCustomerId === 'string',
				'No stripeCustomerId',
			)
			await db
				.update(tenant)
				.set({ tier: 'free' })
				.where(eq(tenant.stripeCustomerId, stripeCustomerId))

			await sendEmail({
				react: (
					<div>
						<p>A subscription was deleted</p>
						<code>{JSON.stringify(subscription.customer, null, 2)}</code>
						<p>
							<a href="https://dashboard.stripe.com/subscriptions">
								Link to stripe dashboard
							</a>
						</p>
					</div>
				),
				subject: 'Subscription deleted',
				to: INFO_EMAIL_ADDRESS,
			})
			break
		}
		case 'customer.subscription.updated':
			subscription = event.data.object

			await sendEmail({
				react: (
					<div>
						<p>A subscription was updated</p>
						<code>{JSON.stringify(subscription.customer, null, 2)}</code>
						{JSON.stringify(subscription.customer, null, 2)}
						<p>
							<a href="https://dashboard.stripe.com/subscriptions">
								Link to stripe dashboard
							</a>
						</p>
					</div>
				),
				subject: 'Subscription updated',
				to: INFO_EMAIL_ADDRESS,
			})
			// Then define and call a method to handle the subscription update.
			// handleSubscriptionUpdated(subscription);
			break

		default:
		// Unexpected event type
	}
	// Return a 200 response to acknowledge receipt of the event
	return {}
}

async function streamToBuffer(
	// eslint-disable-next-line n/no-unsupported-features/node-builtins
	stream: null | ReadableStream<Uint8Array>,
): Promise<Buffer> {
	if (!stream) {
		return Buffer.from('')
	}
	const reader = stream.getReader()
	const chunks: Uint8Array[] = []
	let done: boolean | undefined = false

	while (!done) {
		const { done: doneReading, value } = await reader.read()
		if (value) {
			chunks.push(value)
		}
		done = doneReading
	}

	return Buffer.concat(chunks)
}
