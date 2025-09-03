export function Spacer({
	size,
}: {
	/**
	 * The size of the space
	 *
	 * 4xs: h-4 (16px)
	 *
	 * 3xs: h-8 (32px)
	 *
	 * 2xs: h-12 (48px)
	 *
	 * xs: h-16 (64px)
	 *
	 * sm: h-20 (80px)
	 *
	 * md: h-24 (96px)
	 *
	 * lg: h-28 (112px)
	 *
	 * xl: h-32 (128px)
	 *
	 * 2xl: h-36 (144px)
	 *
	 * 3xl: h-40 (160px)
	 *
	 * 4xl: h-44 (176px)
	 */
	size:
		| '2xl'
		| '2xs'
		| '3xl'
		| '3xs'
		| '4xl'
		| '4xs'
		| 'lg'
		| 'md'
		| 'sm'
		| 'xl'
		| 'xs'
}) {
	const options: Record<typeof size, string> = {
		'2xl': 'h-36',
		'2xs': 'h-12',
		'3xl': 'h-40',
		'3xs': 'h-8',
		'4xl': 'h-44',
		'4xs': 'h-4',
		lg: 'h-28',
		md: 'h-24',
		sm: 'h-20',
		xl: 'h-32',
		xs: 'h-16',
	}
	const className = options[size]
	return <div className={className} />
}
