import { db } from '#app/utils/db.server'
import { event } from '#db/schema/event'

export async function loader() {
	await db.insert(event).values({
		name: 'Generate Ideas',
	})
	return {}
}

export default function GenerateIdeas() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<p className="text-lg font-semibold mb-2">
				We're still working on this feature!
			</p>
			<p className="text-center">
				Email us at{' '}
				<a
					className="text-blue-500 underline"
					href="mailto:info@brainbuildai.com"
				>
					info@brainbuildai.com
				</a>{' '}
				with your product website and we'll generate some ideas for you!
			</p>
		</div>
	)
}
