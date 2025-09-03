import type { AllDemoData, DemoData } from './demo-types'

export const tags = [
	'Omega Project',
	'Client App',
	'Real-time',
	'Federated',
] as const satisfies string[]

const demoData: DemoData<typeof tags> = {
	projects: [
		{
			description:
				'Client app for the Omega Project, a real-time, federated application.',
			id: '1',
			name: 'Client App',
			tags: ['Omega Project', 'Client App', 'Real-time', 'Federated'],
		},
	],
	tags,
	tenantName: 'GraphQL Enterprise',
}

export const allDemoData: AllDemoData<typeof tags> = {
	...demoData,
}
