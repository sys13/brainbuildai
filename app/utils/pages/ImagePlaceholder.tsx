import { cn } from '../misc'

export function ImagePlaceholder({ className }: { className?: string }) {
	return (
		<svg
			className={cn('text-black dark:text-white', className)}
			fill="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Image Placeholder</title>
			<rect
				fill="none"
				height="22"
				stroke="currentColor"
				strokeWidth="2"
				width="22"
				x="1"
				y="1"
			/>
			<line
				stroke="currentColor"
				strokeWidth="2"
				x1="1"
				x2="23"
				y1="1"
				y2="23"
			/>
			<line
				stroke="currentColor"
				strokeWidth="2"
				x1="23"
				x2="1"
				y1="1"
				y2="23"
			/>
		</svg>
	)
}
