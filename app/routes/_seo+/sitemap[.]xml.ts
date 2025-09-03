import { generateSitemap } from '@nasa-gcn/remix-seo'
import type { LoaderFunctionArgs, ServerBuild } from 'react-router'
import { getDomainUrl } from '#app/utils/misc'

export async function loader({ context, request }: LoaderFunctionArgs) {
	const serverBuild = (await context.serverBuild) as ServerBuild
	// @ts-expect-error - route can be undefined
	return generateSitemap(request, serverBuild.routes, {
		headers: {
			'Cache-Control': `public, max-age=${60 * 5}`,
		},
		siteUrl: getDomainUrl(request),
	})
}
