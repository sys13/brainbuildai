export function Hero({ children }: { children?: React.ReactNode }) {
	return (
		<div className="relative isolate overflow-hidden">
			<svg
				aria-hidden="true"
				className="absolute inset-0 -z-10 size-full stroke-white/10 mask-[radial-gradient(100%_100%_at_top_right,white,transparent)]"
			>
				<defs>
					<pattern
						height={200}
						id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
						patternUnits="userSpaceOnUse"
						width={200}
						x="50%"
						y={-1}
					>
						<path d="M.5 200V.5H200" fill="none" />
					</pattern>
				</defs>
				<rect
					fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
					height="100%"
					strokeWidth={0}
					width="100%"
				/>
			</svg>
			<div
				aria-hidden="true"
				className="absolute -z-10 transform-gpu blur-3xl md:top-[calc(50%-20rem)] xl:left-[calc(50%-24rem)]"
			>
				<div
					className="aspect-1108/632 w-277 bg-linear-to-r from-primary to-primary opacity-20"
					style={{
						clipPath:
							'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
					}}
				/>
			</div>
			<div className="mx-auto max-w-7xl px-4 pb-8 sm:pb-12 ">
				<div className="mx-auto max-w-3xl shrink-0 px-2">{children}</div>
			</div>
		</div>
	)
}
