import { bbai } from '#app/utils/bbai/bbai'
import { Container } from '../container'
import { Card } from '../ui/card'
import { Icon, type IconName } from '../ui/icon'
import { LandingSectionHeading } from './landing-section-heading'

export function WhoItsFor() {
	return (
		<div className="landing-section-bg">
			<Container>
				<div className="px-2 pt-8">
					<LandingSectionHeading
						sub="Key benefits for your team"
						text="For Everyone"
					/>
					<div className="grid sm:grid-flow-col mt-6 gap-4">
						{bbai.marketing.personas.map((obj) => (
							<Section {...obj} key={obj.title} />
						))}
					</div>
				</div>
			</Container>
		</div>
	)
}

function Section({
	description,
	icon,
	title,
}: {
	description: string
	icon: IconName
	title: string
}) {
	return (
		<Card className="text-center p-4 flex flex-col flex-1 landing-card-bg">
			<Icon className="text-primary size-12" name={icon} size="xl" />
			<div className="flex justify-center  text-xl mt-2">{title}</div>
			<div className="mt-2 text-secondary-foreground/80">{description}</div>
		</Card>
	)
}
