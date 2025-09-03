import { Container } from '../container'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'

const faqs = [
	{
		answer:
			'BrainBuildAI is a tool that helps Product Managers create clear and detailed product requirement documents (PRDs) quickly and efficiently. It streamlines spec writing, making collaboration easier and reducing development delays.',
		question: 'What is BrainBuildAI?',
	},
	{
		answer:
			"It's designed for Product Managers, but it can also be useful for startup founders, designers, engineers, and anyone involved in defining product features and requirements.",
		question: 'Who is BrainBuildAI for?',
	},
	{
		answer:
			'It provides structured templates, AI-assisted writing, and collaboration tools to ensure that your requirements are well-defined and actionable.',
		question: 'How does BrainBuildAI make PRD creation easier?',
	},
	{
		answer:
			"Yes! Whether you're building a new app, adding a feature, or refining an existing product, BrainBuildAI adapts to your needs.",
		question: 'Can I use BrainBuildAI for different types of projects?',
	},
	{
		answer:
			'Yes, you can collaborate with team members by sharing documents, adding comments, and refining specs together.',
		question: 'Does BrainBuildAI support collaboration?',
	},
	{
		answer:
			'Yes, you can export PRDs as PDFs, Markdown, or directly integrate them with your project management tools.',
		question: 'Can I export my PRD to different formats?',
	},
	{
		answer:
			'Integration with popular tools is planned. Let us know which ones matter most to you!',
		question:
			'Does BrainBuildAI integrate with tools like Jira, Notion, or Confluence?',
	},
	// {
	// 	answer:
	// 		'Yes, you can modify existing templates or create your own to fit your workflow.',
	// 	question: 'Can I customize the PRD templates?',
	// },
	{
		answer:
			'It is currently free in beta. We plan to offer paid plans with additional features in the future. Beta testers will receive a discount on the first paid plan.',
		// answer:
		// 	'We offer a free trial. After that, we have paid plans based on usage and collaboration features.',
		question: 'Is BrainBuildAI free?',
	},
	{
		answer:
			'Your data is stored securely, and we follow industry best practices for encryption and privacy.',
		question: 'How does BrainBuildAI handle data security?',
	},
	{
		answer: 'Yes, only you and the people you invite can access your PRDs.',
		question: 'Will my documents be private?',
	},
	{
		answer: 'You can start by creating a free account—no credit card required.',
		question: 'How do I sign up?',
	},
	{
		answer: 'Yes! We have guides and support to help you get started.',
		question: 'Do you offer onboarding or support?',
	},
	{
		answer:
			'We love feedback! You can share your ideas on the Contact Page, looking forward to your input.',
		question: 'Where can I request a feature or give feedback?',
	},
] satisfies { answer: string; question: string }[]

export function Faqs() {
	return (
		<section
			aria-labelledby="faq-title"
			className="overflow-hidden bg-background py-8"
			id="faq"
		>
			<Container className="relative">
				<div className="">
					<h2
						className="font-display text-3xl tracking-tight text-foreground sm:text-4xl"
						id="faq-title"
					>
						Frequently Asked Questions
					</h2>
				</div>
				{/* <ul className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"> */}
				<Accordion collapsible type="single">
					{faqs.map(({ answer, question }) => (
						<AccordionItem key={question} value={question}>
							<AccordionTrigger>{question}</AccordionTrigger>
							<AccordionContent>{answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
				{/* </ul> */}
			</Container>
		</section>
	)
}
