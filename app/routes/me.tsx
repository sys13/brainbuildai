import { type LoaderFunctionArgs, redirect } from 'react-router'
import { logout, requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const { id, tenantId } = await requireUser(request)
	const user = await db.query.user.findFirst({
		where: { tenantId, id },
	})
	if (!user) {
		const requestUrl = new URL(request.url)
		const loginParams = new URLSearchParams([
			['redirectTo', `${requestUrl.pathname}${requestUrl.search}`],
		])
		const redirectTo = `/login?${loginParams}`
		await logout({ redirectTo, request })
		return redirect(redirectTo)
	}

	return redirect(`/users/${user.username}`)
}
