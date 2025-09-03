import { type ActionFunctionArgs, redirect } from 'react-router'
import { authenticator } from '#app/utils/auth.server'
// import { handleMockAction } from '#app/utils/connections.server'
import { ProviderNameSchema } from '#app/utils/connections'
import { getReferrerRoute } from '#app/utils/misc'
import { getRedirectCookieHeader } from '#app/utils/redirect-cookie.server'

export async function loader() {
	return redirect('/login')
}

export async function action({ params, request }: ActionFunctionArgs) {
	const providerName = ProviderNameSchema.parse(params.provider)

	try {
		// await handleMockAction(providerName, request)
		return await authenticator.authenticate(providerName, request)
	} catch (error: unknown) {
		if (error instanceof Response) {
			const formData = await request.formData()
			const rawRedirectTo = formData.get('redirectTo')
			let redirectTo =
				typeof rawRedirectTo === 'string'
					? rawRedirectTo
					: getReferrerRoute(request)

			if (redirectTo === '/login') {
				redirectTo = '/dashboard'
			}
			console.log('redirectTo', redirectTo)
			const redirectToCookie = getRedirectCookieHeader(redirectTo)
			if (redirectToCookie) {
				error.headers.append('set-cookie', redirectToCookie)
			}
		}

		throw error
	}
}
