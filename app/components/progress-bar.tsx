import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router'
import { useSpinDelay } from 'spin-delay'
import { cn } from '#app/utils/misc'
import { Icon } from './ui/icon'

function EpicProgress() {
	const transition = useNavigation()
	const busy = transition.state !== 'idle'
	const delayedPending = useSpinDelay(busy, {
		delay: 600,
		minDuration: 400,
	})
	const ref = useRef<HTMLDivElement>(null)
	const [animationComplete, setAnimationComplete] = useState(true)

	useEffect(() => {
		if (!ref.current) {
			return
		}

		if (delayedPending) {
			setAnimationComplete(false)
		}

		const animationPromises = ref.current
			.getAnimations()
			.map(({ finished }) => finished)

		Promise.allSettled(animationPromises).then(() => {
			if (!delayedPending) {
				setAnimationComplete(true)
			}
		})
	}, [delayedPending])

	return (
		<div
			aria-hidden={delayedPending ? undefined : true}
			aria-valuetext={delayedPending ? 'Loading' : undefined}
			className="fixed inset-x-0 left-0 top-0 z-50 h-[0.20rem] animate-pulse"
			role="progressbar"
			aria-valuenow={delayedPending ? 50 : 0}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className={cn(
					'h-full w-0 bg-foreground duration-500 ease-in-out',
					transition.state === 'idle' &&
						(animationComplete
							? 'transition-none'
							: 'w-full opacity-0 transition-all'),
					delayedPending && transition.state === 'submitting' && 'w-5/12',
					delayedPending && transition.state === 'loading' && 'w-8/12',
				)}
				ref={ref}
			/>
			{delayedPending && (
				<div className="absolute flex items-center justify-center">
					<Icon
						aria-hidden
						className="m-1 animate-spin text-foreground"
						name="update"
						size="md"
					/>
				</div>
			)}
		</div>
	)
}

export { EpicProgress }
