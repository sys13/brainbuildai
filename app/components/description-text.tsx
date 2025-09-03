import { useState } from 'react'
import { cn } from '#app/utils/misc'
import { cutOffAfterNewLines } from '#app/utils/stringUtils'
import { Button } from './ui/button'

const MAX_LINES = 3

const DescriptionText = ({
	className,
	maxLength = 200,
	text,
}: {
	className?: string
	maxLength?: number
	text: string
}) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const isTextTooLong =
		text.length > maxLength || text.split('\n').length > MAX_LINES

	const displayedText =
		isTextTooLong && !isExpanded
			? `${cutOffAfterNewLines(text.substring(0, maxLength), MAX_LINES)}...`
			: text

	const toggleText = () => {
		setIsExpanded(!isExpanded)
	}

	return (
		<div className={cn(className)}>
			<div>
				<div className="whitespace-pre-wrap tracking-tight">
					{displayedText}{' '}
					{isTextTooLong && (
						<Button
							className="h-6 p-0 leading-none text-foreground"
							onClick={toggleText}
							variant="link"
						>
							{!isExpanded ? 'show more' : 'show less'}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}

export default DescriptionText
