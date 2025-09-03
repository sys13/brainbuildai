export async function createGithubIssue({
	name,
	description,
	repo,
	token,
}: {
	name: string
	description: string | null
	repo: string
	token: string
}) {
	const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
		},
		body: JSON.stringify({
			title: name,
			body: description,
		}),
	})

	if (!response.ok) {
		const err = await response.json()
		console.error('GitHub issue creation failed:', err)
		throw new Error('Failed to create GitHub issue')
	}

	return response.json()
}
