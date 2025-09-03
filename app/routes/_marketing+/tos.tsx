import { Container } from '#app/components/container'
import { Spacer } from '#app/components/spacer'

export default function TermsOfServiceRoute() {
	return (
		<section className="bg-background sm:py-8">
			<Container>
				<div className="md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl mt-4">
						<span className="relative whitespace-nowrap">
							<span className="relative">Terms of Service</span>
						</span>
					</h2>
				</div>
				<Spacer size="2xs" />
				<div className="prose dark:prose-invert xl:prose-xl">
					<p>
						Welcome to BrainBuildAI (“Company”, “we”, “our”, “us”). These Terms
						of Service (“Terms”) govern your access to and use of our website,
						mobile applications, and other online services (collectively, the
						“Services”).
					</p>
					<h2>1. Acceptance of Terms</h2>
					<p />
					<p>
						By accessing or using our Services, you agree to be bound by these
						Terms and our Privacy Policy. If you do not agree to these Terms, do
						not use our Services.
					</p>
					<h2>2. Changes to Terms</h2>
					<p>
						We reserve the right to modify these Terms at any time. We will
						notify you of any changes by posting the new Terms on our website.
						Your continued use of the Services after such changes constitutes
						your acceptance of the new Terms.
					</p>
					<h2>3. Eligibility</h2>
					<p>
						You must be at least 18 years old to use our Services. By using our
						Services, you represent and warrant that you have the legal capacity
						to enter into these Terms.
					</p>
					<h2>4. Account Registration</h2>
					<p>
						To access certain features of our Services, you may need to register
						for an account. You agree to provide accurate, current, and complete
						information during the registration process and to update such
						information as necessary to keep it accurate, current, and complete.
						You are responsible for safeguarding your password and for all
						activities that occur under your account.
					</p>
				</div>
			</Container>
		</section>
	)
}
