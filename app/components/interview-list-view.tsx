import { Link } from 'react-router'
import { Button } from './ui/button'
export interface UserInterview {
	id: string
	name: string
	description: string | null
	customer: string
	suggestedDescription: string | null
	tenantId: string
	createdAt: Date
	updatedAt: Date
}

// type ObjType =
// 	| 'persona'
// 	| 'goal'
// 	| 'problem'
// 	| 'success_criteria'
// 	| 'feature'
// 	| 'userInterview'
interface UserInterviewListProps {
	interviews: UserInterview[]
}

export function UserInterviewList({ interviews }: UserInterviewListProps) {
	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold">User Interviews</h1>
				<Button asChild>
					<Link to="/userinterviews/new">New Interview</Link>
				</Button>
			</div>

			{interviews.length === 0 ? (
				<p className="text-muted-foreground">No interviews found.</p>
			) : (
				<ul className="space-y-2">
					{interviews.map((interview) => (
						<li key={interview.id} className="border rounded-md p-4">
							<Link
								to={`/userinterviews/${interview.id}/edit`}
								className="block hover:underline"
							>
								<div className="font-medium">{interview.name}</div>
								<div className="text-sm text-muted-foreground">
									{interview.description}
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
