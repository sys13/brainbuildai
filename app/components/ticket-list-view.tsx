import { Link } from 'react-router'
import type { models } from '#app/utils/models'
import { Button } from './ui/button'
export interface UserInterview {
	id: string
	name: string
}

type ObjType =
	| 'prd'
	| 'persona'
	| 'goal'
	| 'problem'
	| 'success_criteria'
	| 'feature'
	| 'userInterview'
	| 'ticket'
interface TicketListViewProps {
	model: (typeof models)[ObjType]
	prds: UserInterview[]
}

export function TicketListView({ prds, model }: TicketListViewProps) {
	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold">Tickets</h1>
				<Button asChild>
					<Link to="/tickets/new">New {model.displayNames.singular}</Link>
				</Button>
			</div>

			{prds.length === 0 ? (
				<p className="text-muted-foreground">No tickets found.</p>
			) : (
				<ul className="space-y-2">
					{prds.map((item) => (
						<li key={item.id} className="border rounded-md p-4">
							<Link
								to={model.detailsUrl(item.id)}
								className="block hover:underline"
							>
								<div className="font-medium">{item.name}</div>
								{/* <div className="text-sm text-muted-foreground">
									{interview.description}
								</div> */}
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
