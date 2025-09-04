import { Container } from '#app/components/container'
import { Spacer } from '#app/components/spacer'
import { useEffect, useState } from 'react'
import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Privacy Policy | BrainBuildAI' },
		{
			name: 'description',
			content:
				'Learn how BrainBuildAI protects and manages your personal data through our comprehensive privacy policy.',
		},
	]
}

export default function PrivacyRoute() {
	// Add JSON-LD structured data for the privacy policy
	useEffect(() => {
		const script = document.createElement('script')
		script.type = 'application/ld+json'
		script.textContent = JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: 'Privacy Policy',
			speakable: {
				'@type': 'SpeakableSpecification',
				cssSelector: ['.lead'],
			},
			specialty: 'Privacy Policy',
			lastReviewed: '2025-06-10',
			mainContentOfPage: {
				'@type': 'WebPageElement',
				cssSelector: '.prose',
			},
		})
		document.head.appendChild(script)

		return () => {
			document.head.removeChild(script)
		}
	}, [])

	// Back to top button functionality
	const [showBackToTop, setShowBackToTop] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 300) {
				setShowBackToTop(true)
			} else {
				setShowBackToTop(false)
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		})
	}

	return (
		<section className="bg-background py-6 sm:py-12">
			<Container>
				{/* Print styles */}
				<style>{`
						@media print {
							body { font-size: 12pt; }
							nav, footer, .no-print { display: none !important; }
							.prose { max-width: none !important; }
							a { text-decoration: none !important; color: black !important; }
							h1, h2 { page-break-after: avoid; }
							p, li { page-break-inside: avoid; }
							html, body, section, .container { background: white !important; color: black !important; }
							.print-header { display: block !important; text-align: center; margin-bottom: 20px; }
							.print-date:before { content: "Last Updated: June 10, 2025"; display: block; text-align: center; margin-bottom: 20px; }
						}
					`}</style>

				<div className="print-header" style={{ display: 'none' }}>
					<h1>BrainBuildAI Privacy Policy</h1>
					<div className="print-date" />
				</div>

				<div className="md:text-center">
					{/* Print-friendly header - only visible when printing */}
					<div className="hidden print:block print:text-center print:mb-5">
						<h1 className="text-2xl font-bold">BrainBuildAI Privacy Policy</h1>
						<p>Last Updated: June 10, 2025</p>
					</div>

					<h1 className="font-display text-3xl tracking-tight text-primary sm:text-4xl mt-4 print:hidden">
						<span className="relative whitespace-nowrap">
							<span className="relative">Privacy Policy</span>
						</span>
					</h1>
					<p className="mt-2 text-sm text-muted-foreground flex items-center justify-center gap-4">
						<span>Last Updated: June 10, 2025</span>
						<span className="flex items-center">
							<svg
								className="w-4 h-4 mr-1"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							Estimated reading time: 8 min
						</span>
					</p>
				</div>
				<Spacer size="sm" />
				<div className="prose dark:prose-invert xl:prose-lg max-w-none space-y-8">
					<p className="lead">
						BrainBuildAI ("we", "our", "us") is committed to protecting and
						respecting your privacy. This Privacy Policy explains how we
						collect, use, disclose, and safeguard your information when you
						visit our website https://www.brainbuildai.com, use our services, or
						engage with us in any other way. Please read this policy carefully
						to understand our views and practices regarding your personal data
						and how we will treat it.
					</p>

					<div className="flex justify-end mb-4 print:hidden">
						<a
							href="/api/privacy-policy.pdf"
							download="BrainBuildAI-Privacy-Policy.pdf"
							className="inline-flex items-center px-3 py-1 text-sm bg-muted/50 hover:bg-muted/70 rounded-md transition-colors"
						>
							<svg
								className="w-4 h-4 mr-1"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="7 10 12 15 17 10" />
								<line x1="12" y1="15" x2="12" y2="3" />
							</svg>
							Download PDF
						</a>
					</div>

					<h2 id="information-we-collect" className="pt-8">
						1. Information We Collect
					</h2>
					<p>We may collect and process the following data about you:</p>
					<ul>
						<li>
							<strong>Personal Identification Information:</strong> Name, email
							address, phone number, etc.
						</li>
						<li>
							<strong>Payment Information:</strong> Credit card details, billing
							address, etc.
						</li>
						<li>
							<strong>Technical Data:</strong> IP address, browser type and
							version, time zone setting, browser plug-in types and versions,
							operating system and platform, and other technology on the devices
							you use to access this website.
						</li>
						<li>
							<strong>Usage Data:</strong> Information about how you use our
							website, products, and services.
						</li>
						<li>
							<strong>Marketing and Communications Data:</strong> Your
							preferences in receiving marketing from us and your communication
							preferences.
						</li>
					</ul>

					<h2 id="how-we-collect" className="pt-8">
						2. How We Collect Information
					</h2>
					<p>
						We use different methods to collect data from and about you
						including:
					</p>
					<ul>
						<li>
							<strong>Direct Interactions:</strong> You may give us your
							identity and contact data by filling in forms or by corresponding
							with us by post, phone, email, or otherwise.
						</li>
						<li>
							<strong>Automated Technologies or Interactions:</strong> As you
							interact with our website, we may automatically collect technical
							data about your equipment, browsing actions, and patterns.
						</li>
						<li>
							<strong>Third Parties or Publicly Available Sources:</strong> We
							may receive personal data about you from various third parties.
						</li>
					</ul>

					<h2 id="how-we-use" className="pt-8">
						3. How We Use Your Information
					</h2>
					<p>We use the information we collect in the following ways:</p>
					<ul>
						<li>To provide, operate, and maintain our website and services.</li>
						<li>
							To improve, personalize, and expand our website and services.
						</li>
						<li>
							To understand and analyze how you use our website and services.
						</li>
						<li>
							To develop new products, services, features, and functionality.
						</li>
						<li>
							To communicate with you, including for customer service, updates,
							and marketing purposes.
						</li>
						<li>To process payments and prevent fraudulent transactions.</li>
					</ul>

					<h2 id="information-sharing" className="pt-8">
						4. Information Sharing and Disclosure
					</h2>
					<p>We may share your information in the following situations:</p>
					<ul>
						<li>
							<strong>With Service Providers:</strong> We may share your
							information with third-party vendors, service providers,
							contractors, or agents who perform services for us.
						</li>
						<li>
							<strong>Business Transfers:</strong> We may share or transfer your
							information in connection with a merger, acquisition,
							reorganization, or sale of all or a portion of our assets.
						</li>
						<li>
							<strong>Legal Obligations:</strong> We may disclose your
							information where required to do so by law or in response to valid
							requests by public authorities.
						</li>
						<li>
							<strong>With Your Consent:</strong> We may disclose your
							information for any other purpose with your consent.
						</li>
					</ul>

					<h2 id="data-security" className="pt-8">
						5. Data Security
					</h2>
					<p>
						We have implemented appropriate technical and organizational
						security measures designed to protect the security of any personal
						information we process. However, please note that no electronic
						transmission or storage of information can be entirely secure, and
						we cannot guarantee absolute security.
					</p>

					<h2 id="your-rights" className="pt-8">
						6. Your Rights
					</h2>
					<p>
						Depending on your location, you may have certain rights regarding
						your personal information, including:
					</p>
					<ul>
						<li>
							The right to access the personal information we have about you.
						</li>
						<li>The right to rectify inaccurate personal information.</li>
						<li>
							The right to request the deletion of your personal information.
						</li>
						<li>
							The right to restrict the processing of your personal information.
						</li>
						<li>The right to data portability.</li>
						<li>The right to object to processing.</li>
					</ul>
					<p>
						To exercise these rights, please contact us using the information
						provided in the "Contact Us" section below.
					</p>

					{/* <div className="mt-4 mb-6 p-4 bg-muted/30 rounded-lg border border-primary/10">
						<h3 className="text-lg font-medium mb-2">Data Access Request</h3>
						<p className="text-sm mb-3">
							Under GDPR and similar privacy laws, you have the right to request
							a copy of your personal data that we store. Please use the form
							below to submit your request.
						</p>
						<div className="flex flex-col sm:flex-row gap-2">
							<button
								type="button"
								className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90"
							>
								Download My Data
							</button>
							<button
								type="button"
								className="px-4 py-2 text-sm bg-red-600/10 text-red-600 rounded hover:bg-red-600/20"
							>
								Request Account Deletion
							</button>
						</div>
					</div> */}

					<h2 id="cookies" className="pt-8">
						7. Cookie Policy
					</h2>
					<p>
						Our website uses cookies and similar technologies to distinguish you
						from other users. This helps us provide you with a good experience
						when you browse our website and also allows us to improve our site.
					</p>
					<p>
						A cookie is a small file of letters and numbers that we store on
						your browser or the hard drive of your computer if you agree.
						Cookies contain information that is transferred to your computer's
						hard drive.
					</p>
					<h3>Types of Cookies We Use</h3>
					<ul>
						<li>
							<strong>Strictly Necessary Cookies:</strong> These are essential
							for the website to function properly.
						</li>
						<li>
							<strong>Performance Cookies:</strong> These collect information
							about how you use our website, such as which pages you visit most
							often.
						</li>
						<li>
							<strong>Functionality Cookies:</strong> These allow the website to
							remember choices you make and provide enhanced features.
						</li>
						<li>
							<strong>Targeting/Advertising Cookies:</strong> These are used to
							deliver advertisements more relevant to you and your interests.
							<span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded-full whitespace-nowrap">
								Updated June 2025
							</span>
						</li>
					</ul>
					<p>
						You can set your browser to refuse all or some browser cookies, or
						to alert you when websites set or access cookies. If you disable or
						refuse cookies, please note that some parts of this website may
						become inaccessible or not function properly.
					</p>

					<h2 id="children" className="pt-8">
						8. Children's Privacy
					</h2>
					<p>
						Our Services are not intended for children under the age of 13. We
						do not knowingly collect personal information from children under
						13. If you are a parent or guardian and you are aware that your
						child has provided us with personal information, please contact us.
					</p>

					<h2 id="changes" className="pt-8">
						9. Changes to This Privacy Policy
					</h2>
					<p>
						We may update our Privacy Policy from time to time. We will notify
						you of any changes by posting the new Privacy Policy on this page
						and updating the "Last Updated" date. You are advised to review this
						Privacy Policy periodically for any changes.
					</p>

					<h2 id="contact" className="pt-8">
						10. Contact Us
					</h2>
					<p>
						If you have any questions about this Privacy Policy, please contact
						us at:
					</p>
					<p>
						<strong>Email:</strong> privacy@brainbuildai.com
						<br />
						<strong>Address:</strong> BrainBuildAI, 123 AI Street, Tech City, TC
						12345
					</p>

					<h2 id="accessibility" className="pt-8">
						11. Accessibility Statement
					</h2>
					<p>
						BrainBuildAI is committed to making our website and services
						accessible to all users, regardless of ability or technology. We aim
						to comply with Web Content Accessibility Guidelines (WCAG) 2.1 Level
						AA standards.
						<span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full whitespace-nowrap">
							New Section
						</span>
					</p>
					<p>
						If you encounter any accessibility barriers on our site or have
						suggestions for improvement, please contact us at{' '}
						<a
							href="mailto:info@brainbuildai.com"
							className="text-primary hover:underline"
						>
							info@brainbuildai.com
						</a>
						. We value your feedback and are committed to continuous
						improvement.
					</p>

					<h2 id="glossary">12. Glossary of Terms</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-3 bg-muted/10 rounded-md">
							<h3 className="text-base font-medium mb-1">Personal Data</h3>
							<p className="text-sm">
								Any information relating to an identified or identifiable
								natural person.
							</p>
						</div>
						<div className="p-3 bg-muted/10 rounded-md">
							<h3 className="text-base font-medium mb-1">Processing</h3>
							<p className="text-sm">
								Any operation performed on personal data, such as collection,
								recording, organization, or storage.
							</p>
						</div>
						<div className="p-3 bg-muted/10 rounded-md">
							<h3 className="text-base font-medium mb-1">Data Controller</h3>
							<p className="text-sm">
								The entity that determines the purposes and means of processing
								personal data (in this case, BrainBuildAI).
							</p>
						</div>
						<div className="p-3 bg-muted/10 rounded-md">
							<h3 className="text-base font-medium mb-1">Data Processor</h3>
							<p className="text-sm">
								A third party that processes personal data on behalf of the data
								controller.
							</p>
						</div>
						<div className="p-3 bg-muted/10 rounded-md">
							<h3 className="text-base font-medium mb-1">GDPR</h3>
							<p className="text-sm">
								The General Data Protection Regulation, a regulation in EU law
								on data protection and privacy.
							</p>
						</div>
						<div className="p-3 bg-muted/10 rounded-md">
							<h3 className="text-base font-medium mb-1">CCPA</h3>
							<p className="text-sm">
								The California Consumer Privacy Act, which enhances privacy
								rights for California residents.
							</p>
						</div>
					</div>

					<div className="mt-8 p-4 border border-primary/20 rounded-lg bg-primary/5">
						<p className="text-sm m-0">
							This privacy policy is intended to provide transparency about our
							data practices. If you have any concerns about your privacy or how
							your data is being handled, please don't hesitate to reach out.
						</p>
						<p className="text-sm mt-2 print:hidden">
							<a
								href="/api/privacy-policy.json"
								className="text-primary hover:underline inline-flex items-center"
								rel="nofollow"
							>
								<svg
									className="w-4 h-4 mr-1"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									aria-hidden="true"
									role="img"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1="16" y1="13" x2="8" y2="13" />
									<line x1="16" y1="17" x2="8" y2="17" />
									<polyline points="10 9 9 9 8 9" />
								</svg>
								Machine-readable version (JSON)
							</a>
						</p>
					</div>
				</div>
			</Container>

			{/* Back to Top button */}
			{showBackToTop && (
				<button
					type="button"
					onClick={scrollToTop}
					className="fixed bottom-8 right-8 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-opacity print:hidden z-50"
					aria-label="Back to top"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M18 15l-6-6-6 6" />
					</svg>
				</button>
			)}

			<nav className="my-8 p-5 bg-muted/50 rounded-lg shadow-sm">
				<h2 className="text-xl font-medium mb-4">Contents</h2>
				<ol className="list-decimal pl-5 space-y-2">
					<li>
						<a
							href="#information-we-collect"
							className="text-primary hover:underline"
						>
							Information We Collect
						</a>
					</li>
					<li>
						<a href="#how-we-collect" className="text-primary hover:underline">
							How We Collect Information
						</a>
					</li>
					<li>
						<a href="#how-we-use" className="text-primary hover:underline">
							How We Use Your Information
						</a>
					</li>
					<li>
						<a
							href="#information-sharing"
							className="text-primary hover:underline"
						>
							Information Sharing and Disclosure
						</a>
					</li>
					<li>
						<a href="#data-security" className="text-primary hover:underline">
							Data Security
						</a>
					</li>
					<li>
						<a href="#your-rights" className="text-primary hover:underline">
							Your Rights
						</a>
					</li>
					<li>
						<a href="#cookies" className="text-primary hover:underline">
							Cookie Policy
						</a>
					</li>
					<li>
						<a href="#children" className="text-primary hover:underline">
							Children's Privacy
						</a>
					</li>
					<li>
						<a href="#changes" className="text-primary hover:underline">
							Changes to This Privacy Policy
						</a>
					</li>
					<li>
						<a href="#contact" className="text-primary hover:underline">
							Contact Us
						</a>
					</li>
					<li>
						<a href="#accessibility" className="text-primary hover:underline">
							Accessibility Statement
						</a>
					</li>
					<li>
						<a href="#glossary" className="text-primary hover:underline">
							Glossary of Terms
						</a>
					</li>
				</ol>
			</nav>
		</section>
	)
}
