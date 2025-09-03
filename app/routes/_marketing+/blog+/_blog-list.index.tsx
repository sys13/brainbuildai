import { Link, type LoaderFunctionArgs, useLoaderData } from 'react-router'
import { Container } from '#app/components/container'
import { LandingSectionHeading } from '#app/components/marketing/landing-section-heading'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { formatDateRelative } from '#app/utils/date-utils'
import { db } from '#app/utils/db.server'
import { getDomainUrl } from '#app/utils/misc'

export async function loader({ request }: LoaderFunctionArgs) {
	const posts = await db.query.post.findMany({
		columns: {
			content: true,
			id: true,
			name: true,
			publishedAt: true,
			slug: true,
		},
		orderBy: { publishedAt: 'desc' },
		where: { status: 'published' },
	})
	const domainUrl = getDomainUrl(request)
	return { domainUrl, posts }
}
export default function Blog() {
	const { domainUrl, posts } = useLoaderData<typeof loader>()
	return (
		<section className="landing-section-bg">
			<Container>
				<div className="px-2 pt-8">
					<LandingSectionHeading
						className="my-2"
						sub="The official blog for app AI design"
						text="BrainBuildAI Blog"
					/>
					<div className="grid gap-4 mt-8 md:grid-cols-2">
						{posts.map((post) => (
							<Post domainUrl={domainUrl} key={post.id} post={post} />
						))}
					</div>
				</div>
			</Container>
		</section>
	)
}

function Post({
	domainUrl,
	post,
}: {
	domainUrl: string
	post: Awaited<ReturnType<typeof loader>>['posts'][number]
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Link className="link" to={`${domainUrl}/blog/${post.slug}`}>
						{post.name}
					</Link>
				</CardTitle>
				<CardDescription>
					{formatDateRelative(post.publishedAt ?? new Date())}
				</CardDescription>
			</CardHeader>
		</Card>
	)
}
