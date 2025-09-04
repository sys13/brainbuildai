import { OpenImgContextProvider } from 'openimg/react'
import {
	data,
	Links,
	type LinksFunction,
	type LoaderFunctionArgs,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	type UIMatch,
	useLoaderData,
	useMatches,
	useRouteLoaderData,
} from 'react-router'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import type { Route } from './+types/root'
import appleTouchIconAssetUrl from './assets/favicons/apple-touch-icon.png'
import faviconAssetUrl from './assets/favicons/favicon.svg'
import { GeneralErrorBoundary } from './components/error-boundary'
import { Layout as HighLevelLayout } from './components/layout'
import { EpicProgress } from './components/progress-bar'
import { useToast } from './components/toaster'
import { href as iconsHref } from './components/ui/icon'
import { Toaster } from './components/ui/sonner'
import { useOptionalTheme, useTheme } from './routes/resources+/theme-switch'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUser, logout } from './utils/auth.server'
import { bbai } from './utils/bbai/bbai'
import { ClientHintCheck, getHints } from './utils/client-hints'
import { sidebarState } from './utils/cookies.server'
import { db } from './utils/db.server'
import { getEnv } from './utils/env.server'
import { pipeHeaders } from './utils/headers.server'
import { honeypot } from './utils/honeypot.server'
import { combineHeaders, getDomainUrl, getImgSrc } from './utils/misc'
import { useNonce } from './utils/nonce-provider'
import { getTheme, type Theme } from './utils/theme.server'
import { makeTimings, time } from './utils/timing.server'
import { getToast } from './utils/toast.server'
import { useOptionalUser } from './utils/user'

export const links: LinksFunction = () => {
	return [
		// Preload critical fonts
		{
			rel: 'preload',
			href: '/fonts/nunito-sans/nunito-sans-v12-latin_latin-ext-regular.woff2',
			as: 'font',
			type: 'font/woff2',
			crossOrigin: 'anonymous' as const,
		},
		{
			rel: 'preload',
			href: '/fonts/nunito-sans/nunito-sans-v12-latin_latin-ext-600.woff2',
			as: 'font',
			type: 'font/woff2',
			crossOrigin: 'anonymous' as const,
		},
		{
			rel: 'preload',
			href: '/fonts/nunito-sans/nunito-sans-v12-latin_latin-ext-700.woff2',
			as: 'font',
			type: 'font/woff2',
			crossOrigin: 'anonymous' as const,
		},
		// Preload svg sprite as a resource to avoid render blocking
		{ as: 'image', href: iconsHref, rel: 'preload' },
		{
			rel: 'icon',
			href: '/favicon.ico',
			sizes: '48x48',
		},
		{ href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
		{ rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
		{ rel: 'apple-touch-icon', href: appleTouchIconAssetUrl },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: Route.MetaFunction = ({ data }) => {
	return [
		{ title: data ? bbai.marketing.name : `Error | ${bbai.marketing.name}` },
		{
			content: bbai.marketing.description.meta,
			name: 'description',
		},
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const { id: userId, tenantId } =
		(await time(() => getUser(request), {
			desc: 'getUser in root',
			timings,
			type: 'getUser',
		})) ?? {}

	const user =
		userId && tenantId
			? await time(
					() =>
						db.query.user.findFirst({
							where: {
								id: userId,
								tenantId,
							},
							with: {
								images: true,
								tenant: true,
								roles: { with: { role: true } },
							},
						}),
					{ desc: 'find user in root', timings, type: 'find user' },
				)
			: null
	if (userId && !user) {
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ redirectTo: '/', request })
	}

	const cookieHeader = request.headers.get('Cookie')
	const cookie = (await sidebarState.parse(cookieHeader)) || {}

	const { headers: toastHeaders, toast } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	const allProjects = user
		? await db.query.prd.findMany({
				columns: { id: true, name: true },
				where: {
					tenantId: user.tenantId,
				},
			})
		: []
	return data(
		{
			allProjects,
			ENV: getEnv(),
			honeyProps,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			toast,
			user,
			sidebarOpen: cookie.sidebarOpen,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: Route.HeadersFunction = pipeHeaders

function Document({
	children,
	env = {},
	nonce,
	theme = 'light',
}: {
	children: React.ReactNode
	env?: Record<string, string | undefined>
	nonce: string
	theme?: Theme
}) {
	return (
		<html className={`${theme} h-full`} lang="en">
			<head>
				<meta charSet="utf-8" />
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<meta
					content="BrainBuild is a platform that enables you to quickly generate product specs and wireframes using AI, helping you move from an idea to a prototype design in minutes. Tools for businesses, designers, and developers with features for your entire workflow."
					name="description"
				/>
				<meta content="website" property="og:type" />
				<Links />
			</head>
			<body className="bg-background text-foreground">
				{children}
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: setting env
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
					nonce={nonce}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

export function Layout({ children }: { children: React.ReactNode }) {
	// if there was an error running the loader, data could be missing
	const data = useRouteLoaderData<typeof loader | null>('root')
	const nonce = useNonce()
	const theme = useOptionalTheme()
	return (
		<Document nonce={nonce} theme={theme} env={data?.ENV}>
			{children}
		</Document>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const theme = useTheme()
	const routes = useMatches()
	const routeType = getRouteType(routes)
	useToast(data.toast)

	return (
		<OpenImgContextProvider
			optimizerEndpoint="/resources/images"
			getSrc={getImgSrc}
		>
			<HighLevelLayout
				allProjects={data.allProjects}
				routeType={routeType}
				theme={data.requestInfo.userPrefs.theme}
				user={user}
				initialSidebarOpen={data.sidebarOpen}
			>
				<Outlet />
			</HighLevelLayout>
			<Toaster closeButton position="top-center" theme={theme} />
			<EpicProgress />
		</OpenImgContextProvider>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default AppWithProviders

export const ErrorBoundary = GeneralErrorBoundary

export const routeTypes = ['internal', 'marketing', 'auth', 'other'] as const

function getRouteType(
	routes: UIMatch<unknown, unknown>[],
): (typeof routeTypes)[number] {
	let match = 'other'
	for (const routeType of routeTypes) {
		const routeId = routes[1].id
		if (routeId.startsWith('routes/_wizard')) {
			match = 'internal'
			break
		}
		if (routeId.startsWith('routes/_auth')) {
			match = 'marketing'
			break
		}
		if (routeId.startsWith(`routes/_${routeType}+`)) {
			match = routeType
			break
		}
	}

	return match as (typeof routeTypes)[number]
}
