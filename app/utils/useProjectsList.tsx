import { useRouteLoaderData } from 'react-router'
import { z } from 'zod'

export function useProjectsList() {
	const data = useRouteLoaderData('routes/_internal+/projects+/_layout')
	const projectsSchema = z.array(
		z.object({
			id: z.string(),
			name: z.string(),
		}),
	)

	const projectsData = projectsSchema.safeParse(data)
	if (projectsData.success) {
		return projectsData.data
	}
	return null
}
