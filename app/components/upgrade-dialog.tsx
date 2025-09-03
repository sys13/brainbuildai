import type React from 'react'
import { Plan } from './pricing-plans'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from './ui/dialog'

export function UpgradeDialog({
	children,
	willTrigger,
}: {
	children: React.ReactNode
	willTrigger?: boolean
}) {
	return (
		<Dialog>
			{willTrigger ? (
				<DialogTrigger asChild>{children}</DialogTrigger>
			) : (
				children
			)}
			<DialogContent>
				<DialogHeader>
					<Plan
						className="w-full max-w-full"
						description="Our most popular plan with advanced features"
						featured
						features={[
							'Unlimited pages',
							'Unlimited projects',
							'Unlimited AI requests',
							'Database Models',
							'Slides and PDF',
							'Team Support and a scoping call to refine your idea',
						]}
						href="/register"
						name="Team"
						price="$14.99/month"
						priceId={
							process.env.NODE_ENV === 'production'
								? 'price_1QT2ZTCazSmF6isZdFKciT5P'
								: 'price_1PlsDcCazSmF6isZRd0Tmjbb'
						}
					/>
					{/* <span>With pro you can:</span>
						<ul className="list-disc list-inside">
							<li>Have more than 3 pages</li>
							<li>Have more than 1 project</li>
							<li>Export to PDF and Slides</li>
							<li>1 design review call with the founder of BrainBuild</li>
							<li>Premium Support</li>
						</ul> */}
				</DialogHeader>
				<DialogFooter className="mt-4">
					<DialogClose asChild>Close</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
