import * as Sentry from '@sentry/react-router'

export function init() {
	Sentry.init({
		beforeSend(event) {
			if (event.request?.url) {
				const url = new URL(event.request.url)
				if (
					url.protocol === 'chrome-extension:' ||
					url.protocol === 'moz-extension:'
				) {
					// This error is from a browser extension, ignore it
					return null
				}
			}
			return event
		},
		dsn: ENV.SENTRY_DSN,
		environment: ENV.MODE,
		integrations: [
			Sentry.replayIntegration(),
			Sentry.browserProfilingIntegration(),
		],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,

		// Capture Replay for 10% of all sessions,
		// plus for 100% of sessions with an error
		replaysOnErrorSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
	})
}
