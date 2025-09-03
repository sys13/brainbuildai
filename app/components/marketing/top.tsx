import { useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { cn } from '#app/utils/misc'
import { useOptionalUser } from '#app/utils/user'
import { Spacer } from '../spacer'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

export function Top({ className }: { className?: string }) {
	const [whatToBuild, setWhatToBuild] = useState('')
	const user = useOptionalUser()

	const fetcher = useFetcher()
	const formData = new FormData()
	formData.append('whatToBuild', whatToBuild)

	const submitButton = (
		<Button
			className="w-full md:max-w-32 self-end"
			disabled={whatToBuild === ''}
			onClick={
				user !== undefined
					? () =>
							fetcher.submit(formData, {
								action: '/resources/wizard-landing-signed-up',
								method: 'post',
							})
					: undefined
			}
			size="lg"
			tabIndex={0}
		>
			<Icon className="text-lg text-white" name="wand-2">
				<span className="text-white">Start</span>
			</Icon>
		</Button>
	)

	return (
		<div className={cn('lg:-mx-12', className)}>
			<div className="">
				<div className="border-secondary-foreground/20 border-2 py-3 px-4 rounded-lg">
					<p className="text-lg font-semibold">
						Write your product specs better and faster, with AI superpowers
					</p>
					<p className="mt-4 ">
						BrainBuildAI gives Product Managers an AI assistant that knows your
						product context, provides helpful suggestions, while keeping you in
						control.
					</p>
				</div>
				<Spacer size="3xs" />
				<Label className="text-2xl text-primary" htmlFor="whatToBuild">
					What's your next product idea?
				</Label>
				<Textarea
					className="bg-background mt-2 text-xl min-h-[120px] border-2"
					id="whatToBuild"
					name="whatToBuild"
					onChange={(event) => {
						setWhatToBuild(event.target.value)
					}}
					placeholder="eg: add coupons to our checkout flow"
					value={whatToBuild}
				/>
				<div className="flex justify-end mt-4">
					{/* <Link to="/gen-ideas">
						<Button
							className="mr-2"
							size="lg"
							// tabIndex={2}
							variant="outline"
						>
							<Icon name="lightbulb">Not Sure? Generate PRD Ideas</Icon>
						</Button>
					</Link> */}
					{user !== undefined ? (
						submitButton
					) : (
						<Link to={`/signup?whatToBuild=${encodeURIComponent(whatToBuild)}`}>
							{submitButton}
						</Link>
					)}
				</div>
			</div>
		</div>
	)
}
