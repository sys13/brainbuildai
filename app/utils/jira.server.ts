export async function createJiraIssue({
	name,
	description,
	email,
	apiToken,
	projectKey,
	baseUrl,
}: {
	name: string
	description: string | null
	email: string
	apiToken: string
	projectKey: string
	baseUrl: string
}) {
	const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
		method: 'POST',
		headers: {
			Authorization: `Basic  ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			fields: {
				project: {
					key: projectKey,
				},
				summary: name,
				description: {
					type: 'doc',
					version: 1,
					content: [
						{
							type: 'paragraph',
							content: [{ type: 'text', text: description }],
						},
					],
				},
				issuetype: {
					name: 'Task', // or 'Story', 'Bug', etc.
				},
			},
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		console.error('Jira issue creation failed:', error)
		throw new Error('Failed to create Jira issue')
	}

	return response.json()
}
