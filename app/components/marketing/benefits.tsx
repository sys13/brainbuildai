import { bbai } from '#app/utils/bbai/bbai'
import { Container } from '../container'
import { Card, CardHeader } from '../ui/card'
import { Icon } from '../ui/icon'
import { LandingSectionHeading } from './landing-section-heading'

export function Benefits() {
	return (
		<section className="landing-section-bg">
			<Container>
				<div className="grid gap-4 px-2 pt-8">
					<LandingSectionHeading
						sub="Better prototypes, faster"
						text="Go with BrainBuild"
					/>
					<div className="grid lg:grid-flow-col mt-6 gap-4">
						{bbai.marketing.benefits.map(({ description, icon, title }) => (
							<Card className="landing-card-bg bg-white/50" key={title}>
								<CardHeader>
									<div className="flex">
										<div className="w-min py-3 px-4 rounded-lg mr-6 flex size-10 self-center">
											<Icon
												className="text-primary self-center"
												name={icon}
												size="xl"
											/>
										</div>
										<div className="flex-1">
											<p className="font-bold text-xl">{title}</p>
											<p className="text-secondary-foreground/85">
												{description}
											</p>
										</div>
									</div>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>
			</Container>
		</section>
	)
}
