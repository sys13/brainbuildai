import type { IconName } from '@/icon-name'
import type { SVGProps } from 'react'
import { cn } from '#app/utils/misc'
import href from './icons/sprite.svg'

export { href, type IconName }

const sizeClassName = {
	font: 'size-[1em]',
	lg: 'size-6',
	md: 'size-5',
	sm: 'size-4',
	xl: 'size-7',
	xs: 'size-3',
} as const

type Size = keyof typeof sizeClassName

const childrenSizeClassName = {
	font: 'gap-1.5',
	lg: 'gap-2',
	md: 'gap-2',
	sm: 'gap-1.5',
	xl: 'gap-3',
	xs: 'gap-1.5',
} satisfies Record<Size, string>

/**
 * Renders an SVG icon. The icon defaults to the size of the font. To make it
 * align vertically with neighboring text, you can pass the text as a child of
 * the icon and it will be automatically aligned.
 * Alternatively, if you're not ok with the icon being to the left of the text,
 * you need to wrap the icon and text in a common parent and set the parent to
 * display "flex" (or "inline-flex") with "items-center" and a reasonable gap.
 */
export function Icon({
	children,
	className,
	name,
	size = 'font',
	...props
}: SVGProps<SVGSVGElement> & {
	name: IconName
	size?: Size
}) {
	if (children) {
		return (
			<span
				className={`inline-flex items-center ${childrenSizeClassName[size]}`}
			>
				<Icon className={className} name={name} size={size} {...props} />
				{children}
			</span>
		)
	}

	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			{...props}
			className={cn(sizeClassName[size], 'inline self-center', className)}
			data-icon={name}
		>
			<use href={`${href}#${name}`} />
		</svg>
	)
}
