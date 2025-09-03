import { Container } from '../container'
import { Plans } from '../pricing-plans'
import { LandingSectionHeading } from './landing-section-heading'

const copy = {
	sub: 'Get started with a free plan or upgrade anytime.',
}

export function Pricing() {
	return (
		<section aria-label="Pricing" className="landing-section-bg" id="pricing">
			<Container>
				<div className="px-2 pt-8">
					<LandingSectionHeading sub={copy.sub} text="Pricing" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-x-4 w-full sm:justify-between sm:pt-6 gap-y-4 mt-6">
						<Plans />
					</div>
				</div>
			</Container>
		</section>
	)
}
