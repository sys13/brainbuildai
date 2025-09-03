export function Logo() {
	return (
		<div className="flex shrink-0 items-center text-2xl font-medium">
			<div className="flex  items-center justify-center rounded-full text-xl font-bold text-secondary">
				<img
					alt="Logo"
					className="max-w-[35px] h-auto object-contain"
					src="/favicon.svg"
				/>
			</div>
			<span className="ml-2 text-2xl font-semibold text-primary">
				BrainBuild
			</span>
		</div>
	)
}
