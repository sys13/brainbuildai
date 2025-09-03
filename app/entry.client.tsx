import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	import('./utils/monitoring.client.js').then(({ init }) => init())
}

startTransition(() => {
	hydrateRoot(document, <HydratedRouter />)
})
