import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { Container } from '#app/components/container'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { Plans } from '#app/components/pricing-plans'
import { Switch } from '#app/components/ui/switch'

const copy = {
	sub: 'Get started with a free plan or upgrade anytime.',
}

export const meta: MetaFunction = () => {
	return [{ title: 'BrainBuildAI: Pricing' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export default function PricingRoute() {
	const [annual, setAnnual] = useState(false)
	return (
		<section
			aria-label="Pricing"
			className="bg-background sm:py-8"
			id="pricing"
		>
			<Container>
				<div className="md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl mt-4">
						<span className="relative whitespace-nowrap">
							<span className="relative">Pricing</span>
						</span>
					</h2>
					<p className="mt-2 text-md text-muted-foreground">{copy.sub}</p>
					<div className="mt-4 flex justify-center items-center gap-2">
						<span className="text-sm text-muted-foreground">Monthly</span>
						<Switch checked={annual} onCheckedChange={setAnnual} />
						<span className="text-sm text-muted-foreground">Annual</span>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-x-4 w-full sm:justify-center py-8 gap-y-4">
					<Plans annual={annual} />
				</div>
			</Container>
		</section>
	)
}
