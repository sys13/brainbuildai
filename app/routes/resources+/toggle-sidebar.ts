import { type ActionFunctionArgs, data } from 'react-router'
import { sidebarState } from '#app/utils/cookies.server.js'

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get('Cookie')
	const cookie = (await sidebarState.parse(cookieHeader)) || {}
	const bodyParams = await request.formData()
	const result = bodyParams.get('sidebarOpen')

	if (result === 'true') {
		cookie.sidebarOpen = false
	} else {
		cookie.sidebarOpen = true
	}

	return data(
		{},
		{
			headers: {
				'Set-Cookie': await sidebarState.serialize(cookie),
			},
		},
	)
}
