import closeWithGrace from 'close-with-grace'
import { http, passthrough } from 'msw'
import { setupServer } from 'msw/node'
import { handlers as resendHandlers } from './resend'

const miscHandlers = [
	http.post('https://api.openai.com/v1/chat/completions', () => {
		return passthrough()
	}),
	http.all('*/pdf', () => {
		return passthrough()
	}),
].filter(Boolean)

export const server = setupServer(
	...miscHandlers,
	...resendHandlers,
	// ...githubHandlers,
)

server.listen({
	onUnhandledRequest(request, print) {
		// Do not print warnings on unhandled requests to https://<:userId>.ingest.us.sentry.io/api/
		// Note: a request handler with passthrough is not suited with this type of url
		//       until there is a more permissible url catching system
		//       like requested at https://github.com/mswjs/msw/issues/1804

		if (request.url.includes('.sentry.io')) {
			return
		}
		if (request.url.includes('react-router-devtools-request')) {
			return
		}
		if (request.url.includes('devtools/browser')) {
			return
		}

		// Print the regular MSW unhandled request warning otherwise.
		print.warning()
	},
})

if (process.env.NODE_ENV !== 'test') {
	console.info('🔶 Mock server installed')

	closeWithGrace(() => {
		server.close()
	})
}
