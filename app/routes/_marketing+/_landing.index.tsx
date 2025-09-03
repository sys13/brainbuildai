import type { MetaFunction } from 'react-router'
import { Faqs } from '#app/components/marketing/faqs'
import { Features } from '#app/components/marketing/features'
import { Hero } from '#app/components/marketing/hero'
import { Top } from '#app/components/marketing/top'
import NewsletterSignup from '../resources+/newsletter-signup'

export const meta: MetaFunction = () => [{ title: 'BrainBuild' }]

// export async function loader({ request }: LoaderFunctionArgs) {
// 	// const publicTenantId = (
// 	// 	await db.query.tenant.findFirst({
// 	// 		where: eq(tenant.name, 'Public Gallery'),
// 	// 		columns: { id: true },
// 	// 	})
// 	// )?.id
// 	// invariantResponse(publicTenantId, 'Public Gallery tenant not found')

// 	return json({ location: request.url })
// }

export default function Landing() {
	return (
		<div className="-m-4">
			<Hero>
				<Top className="mt-6" />
			</Hero>
			<Features />
			<Faqs />
			<div className="mx-4 flex justify-center">
				<NewsletterSignup className="mt-6 sm:max-w-lg   " />
			</div>
		</div>
	)
}
