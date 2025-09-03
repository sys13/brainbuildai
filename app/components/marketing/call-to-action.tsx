import { Link } from 'react-router'
import { Container } from '../container'
import { Button } from '../ui/button'

const copy = {
	main: 'Get started today',
	next: 'Start your customer adoption journey with BrainBuild',
	offer: 'Book your demo',
}

export function CallToAction() {
	return (
		<section
			className="relative overflow-hidden bg-secondary py-16"
			id="get-started-today"
		>
			<Container className="relative">
				<div className="mx-auto max-w-lg text-center">
					<h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
						{copy.main}
					</h2>
					<p className="mt-4 text-lg tracking-tight text-foreground">
						{copy.next}
					</p>
					<Link to="/contact">
						<Button className="mt-8" variant="outline">
							{copy.offer}
						</Button>
					</Link>
				</div>
			</Container>
		</section>
	)
}
