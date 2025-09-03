import { Container } from '#app/components/container'
import { Spacer } from '#app/components/spacer'

const copy = {
	sub: 'Learn more about BrainBuildAI',
}
export default function AboutRoute() {
	return (
		<section aria-label="about" className="bg-background sm:py-8" id="about">
			<Container>
				<div className="md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl mt-4">
						<span className="relative whitespace-nowrap">
							<span className="relative">About</span>
						</span>
					</h2>
					<p className="mt-2 text-md text-muted-foreground">{copy.sub}</p>
				</div>
				<Spacer size="4xs" />
				<div className="prose xl:prose-xl text-secondary-foreground ">
					<p>
						BrainBuildAI is a platform that helps you design apps. We help you
						understand your problem, personas, pains, features, and pages.
						You're then ready to build!
					</p>
					<h3 className="text-secondary-foreground">Founder Profile</h3>
					<b>Daniel Arrizza</b>: Toronto, Canada
					<p>
						Daniel has worked in multiple silicon valley hyper-growth startups.
						Most recently was at the data and AI company, Databricks where he
						was a Sr. Staff Customer Success Engineer. He helped with Delta Lake
						adoption, data engineering training, field/product alignment, and
						teaching generative AI. He was previously at AppDynamics (now part
						of Cisco) where he worked in performance optimization of distributed
						systems.
					</p>
					<p />
				</div>
			</Container>
		</section>
	)
}
