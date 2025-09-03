import { invariantResponse } from '@epic-web/invariant'
import Markdown from 'react-markdown'
import type { LoaderFunctionArgs } from 'react-router'
import { Link, type MetaFunction, useLoaderData } from 'react-router'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { Spacer } from '#app/components/spacer'
import NewsletterSignup from '#app/routes/resources+/newsletter-signup'
import { requireSuperAdminUser } from '#app/utils/auth.server'
import { formatDateRelative } from '#app/utils/date-utils'
import { db } from '#app/utils/db.server'
import { getDomainUrl } from '#app/utils/misc'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { slug } = params
	invariantResponse(slug, 'No slug found')

	const post = await db.query.post.findFirst({
		where: { slug },
	})
	invariantResponse(post, 'Post not found')

	if (post.status !== 'published') {
		await requireSuperAdminUser(request)
	}
	const domainUrl = getDomainUrl(request)

	return { domainUrl, post }
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
	const post = data?.post
	const href = data?.domainUrl + location.pathname
	invariantResponse(post, 'Post not found')
	return [
		{
			description: post.metaDescription,
			keywords: post.metaKeywords,
			title: post.metaTitle,
		},
		{
			href,
			rel: 'canonical',
			tagName: 'link',
		},
	]
}

export default function BlogPost() {
	const { post } = useLoaderData<typeof loader>()
	return (
		<div className="flex flex-col items-center mt-2 mx-4">
			<article className="prose dark:prose-invert lg:prose-xl mt-2">
				<div className="self-start">
					<Link className="link text-muted-foreground" to="/blog">
						BrainBuildAI Blog
					</Link>
				</div>
				<Spacer size="4xs" />
				<h1 className="mb-0 sm:mb-0 lg:mb-0">{post.name}</h1>
				{post.publishedAt ? (
					<div className="leading-tight mt-4 text-muted-foreground">
						Published: {formatDateRelative(post.publishedAt)}
					</div>
				) : null}
				<div className="-mt-1 text-muted-foreground">
					Author: Daniel Arrizza (Founder)
				</div>
				<Markdown
					components={{
						h1: 'h2',
						h2: 'h3',
					}}
				>
					{post.content}
				</Markdown>
				<div className="self-start">
					See more articles on the{' '}
					<Link className="link text-muted-foreground" to="/blog">
						BrainBuildAI Blog
					</Link>
				</div>
			</article>
			<NewsletterSignup className="mt-8" />
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
