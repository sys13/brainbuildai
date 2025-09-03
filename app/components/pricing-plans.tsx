import { cn } from '#app/utils/misc'
import { useOptionalUser } from '#app/utils/user'
import ButtonLink from './link-button'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export function Plans({ annual = false }: { annual?: boolean }) {
	const user = useOptionalUser()
	const teamPrice = annual ? '$149/year' : '$14.99/month'
	return (
		<>
			<Plan
				description="The full platform with all features and integrations"
				features={[
					'Unlimited PRDs',
					'SSO & SAML',
					'Premium Support',
					'Access to our Product Managers',
					'Custom Integrations',
				]}
				href="/contact"
				name="Enterprise"
			/>

			<Plan
				badge="Most Popular"
				description="Our most popular plan with advanced features"
				featured
				features={[
					'Unlimited AI requests',
					'Team Support',
					'Scoping call to refine your idea',
				]}
				href="/register"
				name="Team"
				note="You'll be redirected to a secure payment page"
				price={teamPrice}
				priceId={
					process.env.NODE_ENV === 'production'
						? 'price_1QT2ZTCazSmF6isZdFKciT5P'
						: 'price_1PlsDcCazSmF6isZRd0Tmjbb'
				}
			/>
			<Plan
				description="Get started to explore our platform"
				features={[
					'1 PRD',
					'PRD Builder',
					'AI Suggestions',
					'User Stories',
					'Export to PDF',
				]}
				href={user ? '/signup' : '/login'}
				name="Free"
				note="Limited to one PRD"
			/>
		</>
	)
}

export function Plan({
	className,
	description,
	featured = false,
	features,
	href,
	name,
	price,
	priceId,
	badge,
	note,
}: {
	className?: string
	description: string
	featured?: boolean
	features: string[]
	href: string
	name: string
	price?: string
	priceId?: string
	badge?: string
	note?: string
}) {
	return (
		<section
			className={cn(
				'md:max-w-sm bg-gray shadow-lg px-8 py-6 border-spacing-1 h-full border rounded-lg',
				featured ? 'bg-primary text-white' : 'text-primary landing-card-bg',
				className,
			)}
		>
			{badge ? (
				<Badge className="mb-2" variant="secondary">
					{badge}
				</Badge>
			) : null}
			<h3 className="text-2xl">{name}</h3>
			<p
				className={cn(
					'mt-4 text-sm sm:h-12',
					featured ? 'text-white' : 'text-foreground',
				)}
			>
				{description}
			</p>
			<p className="my-4 text-3xl font-light tracking-tight sm:h-12 ">
				{price ?? ''}
			</p>
			<ul
				className={cn(
					'flex flex-col gap-y-3 text-sm mt-2 h-44 align-top',
					featured ? 'text-white' : 'text-foreground',
				)}
			>
				{features.map((feature) => (
					<li className="flex" key={feature}>
						{feature !== 'plus' && (
							<>
								<Icon
									className={cn(
										'min-w-4',
										featured ? 'text-white' : 'text-foreground',
									)}
									name="check"
								/>
								<span className="ml-4">{feature}</span>
							</>
						)}
						{feature === 'plus' && (
							<Icon
								className="size-3 text-body-md mx-auto text-center"
								name="plus"
							/>
						)}
					</li>
				))}
			</ul>
			<div className="flex align-bottom">
				{priceId ? (
					<form action="/resources/create-checkout-session" method="POST">
						<input name="priceId" type="hidden" value={priceId} />
						<Button
							className={cn(
								'mt-8 order-last flex items-center',
								featured && 'text-primary dark:text-secondary-foreground',
							)}
							id="checkout-and-portal-button"
							type="submit"
							variant="secondary"
						>
							Get Started
						</Button>
						{note ? (
							<p className="mt-2 text-xs text-muted-foreground">{note}</p>
						) : null}
					</form>
				) : (
					<>
						<ButtonLink
							aria-label={`Get started with the ${name} plan for ${price}`}
							className={cn(
								'mt-8 order-last flex items-center',
								featured && 'text-primary dark:text-secondary-foreground',
							)}
							to={href}
							variant={featured ? 'secondary' : 'outline'}
						>
							{name === 'Enterprise' ? 'Contact us' : 'Get started'}
						</ButtonLink>
						{note ? (
							<p className="mt-2 text-xs text-muted-foreground">{note}</p>
						) : null}
					</>
				)}
			</div>
		</section>
	)
}
