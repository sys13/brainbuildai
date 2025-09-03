import { count } from 'drizzle-orm'
import type { LoaderFunctionArgs } from 'react-router'
// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { db } from '#app/utils/db.server'
import { user } from '#db/schema/base'

export async function loader({ request }: LoaderFunctionArgs) {
	const host =
		request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')

	try {
		// if we can connect to the database and make a simple query
		// and make a HEAD request to ourselves, then we're good.
		await Promise.all([
			db.select({ value: count() }).from(user),
			fetch(`${new URL(request.url).protocol}${host}`, {
				headers: { 'X-Healthcheck': 'true' },
				method: 'HEAD',
			}).then((r) => {
				if (!r.ok) {
					return Promise.reject(r)
				}
			}),
		])
		return new Response('OK')
	} catch (error: unknown) {
		console.log('healthcheck ❌', { error })
		return new Response('ERROR', { status: 500 })
	}
}
