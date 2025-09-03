import { bbai } from '#app/utils/bbai/bbai'
import { cn } from '#app/utils/misc'
import { Container } from '../container'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Icon } from '../ui/icon'
import { LandingSectionHeading } from './landing-section-heading'

export function Features() {
	return (
		<section className="landing-section-bg">
			<Container>
				<div className="px-2 pt-8">
					<LandingSectionHeading
						className=""
						sub="Build something great"
						text="Features"
					/>
					<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mt-6">
						{bbai.marketing.features.map(
							({ description, icon, title }, index) => (
								<Card
									className={cn(
										[0, 5].includes(index) && 'sm:col-span-2',
										'landing-card-bg',
									)}
									key={title}
								>
									<CardHeader>
										<div className="flex justify-center mb-4">
											<div className="bg-muted w-min py-3 px-4 rounded-lg">
												<Icon className="text-primary" name={icon} />
											</div>
										</div>
										<CardTitle className="text-center">{title}</CardTitle>
										<CardDescription className="text-center">
											{description}
										</CardDescription>
									</CardHeader>
								</Card>
							),
						)}
					</div>
				</div>
			</Container>
		</section>
	)
}
