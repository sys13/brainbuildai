import { Card } from '../ui/card'
import { Icon } from '../ui/icon'

export function Deliverable() {
	return (
		<div className="py-2">
			<div className="flex mt-4">
				<C
					images=<Icon
						className="text-secondary-foreground/60 size-16 min-w-8"
						name="lightbulb"
					/>
					text="Your Product Ideas"
				/>

				<Icon className="sm:mx-4 min-w-6" name="arrow-right" size="lg" />

				<C
					images={
						<img
							className="size-16"
							src="/img/wireframes.svg"
							alt="Wireframes"
						/>
					}
					text="Product Specs and Wireframes"
				/>
			</div>
		</div>
	)
}

function C({
	images,
	text,
}: {
	images: React.ReactNode
	text: React.ReactNode
}) {
	return (
		<Card className="text-center p-4 flex flex-col flex-1 dark:bg-background/30 bg-primary-foreground/50">
			<div className="flex justify-center h-16 place-items-center">
				{images}
			</div>
			<div className="mt-2 text-lg h-full">{text}</div>
		</Card>
	)
}
