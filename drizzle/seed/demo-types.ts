export interface DemoData<Tags extends string[]> {
	projects: {
		description: string
		id: string
		name: string
		tags?: Tags[number][]
	}[]
	tags: readonly string[]
	tenantName: string
}

export type AllDemoData<Tags extends string[]> = DemoData<Tags>
