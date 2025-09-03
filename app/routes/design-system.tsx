import { Card } from '#app/components/ui/card'

export default function DesignSystem() {
	return (
		<div className="container">
			<div className="container mt-4 grid grid-flow-row-dense grid-cols-2 gap-4">
				<div className="size-10">No style</div>
				<div />
				<div className="size-10 text-foreground">Foreground</div>
				<div className="size-10 text-background">Background</div>
				<div className="size-10 text-accent">Accent</div>
				<div className="size-10 text-accent-foreground">Accent Foreground</div>
				<div className="size-10 text-primary">Primary</div>
				<div className="size-10 text-primary-foreground">PrimaryForeground</div>
				<div className="size-10 text-secondary">Secondary</div>
				<div className="size-10 text-secondary-foreground">
					Secondary Foreground
				</div>
				<div>hi3</div>
				<Card>Stuff</Card>
			</div>
			<h1 className="mt-10 text-2xl">Muted background</h1>
			<div className="container mt-4 grid grid-flow-row-dense grid-cols-2 gap-4 bg-muted">
				<div className="size-10">No style</div>
				<div />
				<div className="size-10 text-foreground">Foreground</div>
				<div className="size-10 text-background">Background</div>
				<div className="size-10 text-accent">Accent</div>
				<div className="size-10 text-accent-foreground">Accent Foreground</div>
				<div className="size-10 text-primary">Primary</div>
				<div className="size-10 text-primary-foreground">PrimaryForeground</div>
				<div className="size-10 text-secondary">Secondary</div>
				<div className="size-10 text-secondary-foreground">
					Secondary Foreground
				</div>
				<Card>Stuff</Card>
			</div>
		</div>
	)
}
