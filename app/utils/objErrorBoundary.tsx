import { GeneralErrorBoundary } from '#app/components/error-boundary'
import type { models } from './models'

export default function ObjErrorBoundary(
	model: (typeof models)[keyof typeof models],
) {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that (403)</p>,
				404: ({ params }) => (
					<p>
						No {model.displayNames.singular} with the id "{params.id}" exists
					</p>
				),
			}}
		/>
	)
}
