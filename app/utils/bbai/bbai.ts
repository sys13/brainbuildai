import type { BBAI } from './types'

export const bbai: BBAI = {
	marketing: {
		benefits: [
			{
				description: 'Transform ideas into comprehensive PRDs in minutes',
				icon: 'rocket',
				title: 'Fast',
			},
			{
				description: 'AI-powered suggestions to refine your requirements',
				icon: 'wand-2',
				title: 'Smart',
			},
			{
				description: 'Collaborate seamlessly with your team',
				icon: 'users',
				title: 'Collaborative',
			},
		],
		description: {
			meta: 'BrainBuildAI is an AI-driven tool that helps you craft detailed product requirement docs effortlessly. Perfect for product managers, designers, and developers aiming to streamline their product planning process.',
			short: 'BrainBuildAI: Write clear, concise PRDs with AI support',
		},
		features: [
			{
				description: 'Generate structured PRD outlines from your ideas',
				icon: 'layout-template',
				title: 'Outline Generator',
			},
			{
				description: 'Customize sections to fit your project needs',
				icon: 'grid-2x2-plus',
				title: 'Flexible Templates',
			},
			{
				description: 'Integrate market research and user insights',
				icon: 'chart-spline',
				title: 'Data Integration',
			},
			{
				description: 'Collaborate with team members in real time',
				icon: 'users',
				title: 'Team Collaboration',
			},
			{
				description: 'Export your PRDs as slides or PDFs for easy sharing',
				icon: 'file-text',
				title: 'Easy Export',
			},
		],
		hero: {
			main: 'Craft comprehensive PRDs in minutes with AI',
			sub: 'Ready to streamline your product planning?',
		},
		name: 'BrainBuildAI',
		personas: [
			{
				description:
					'Define product requirements quickly to accelerate development',
				icon: 'list-check',
				title: 'Product Managers',
			},
			{
				description:
					'Get a head start on structured PRDs without starting from scratch',
				icon: 'brush',
				title: 'Designers',
			},
			{
				description:
					'Integrate detailed requirements to guide your development',
				icon: 'code',
				title: 'Developers',
			},
		],
	},
	websiteDomain: 'www.brainbuildai.com',
}
