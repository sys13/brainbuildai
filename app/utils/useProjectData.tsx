import { useRouteLoaderData } from 'react-router'
import { z } from 'zod'

export function usePRDData() {
	const data = useRouteLoaderData('routes/_internal+/projects+/$prdId+/_layout')
	const prd = z.object({
		canNewProject: z.boolean(),
		prd: z.object({
			id: z.string(),
			name: z.string(),
		}),
	})

	const projectData = prd.safeParse(data)
	if (projectData.success) {
		return projectData.data
	}
	return null
}
