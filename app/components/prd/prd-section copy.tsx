import React from 'react'
import { Await } from 'react-router'
import type { sectionNames } from '#app/routes/_internal+/prds+/$prdId+/_prd_id.index'
import { BackgroundInfoSection } from '#app/routes/resources+/prd-background-info.js'
import { ContextSection } from '#app/routes/resources+/prd-context'
import { DesignSection } from '#app/routes/resources+/prd-design'
import { FeaturesSection } from '#app/routes/resources+/prd-features'
import { GoalsSection } from '#app/routes/resources+/prd-goals'
import { PersonasSection } from '#app/routes/resources+/prd-personas'
import { ProblemsSection } from '#app/routes/resources+/prd-problems'
import { RisksSection } from '#app/routes/resources+/prd-risks'
import { StoriesSection } from '#app/routes/resources+/prd-stories'
import { SuccessCriteriaSection } from '#app/routes/resources+/prd-success-criteria'
import { SummarySection } from '#app/routes/resources+/prd-summary'
import { TicketsSection } from '#app/routes/resources+/prd-tickets'
import { UserInterviewSection } from '#app/routes/resources+/prd-user-interviews.js'
import type {
	ContextFileClient,
	DesignImageClient,
	DesignLinkClient,
	ExistingAndSuggestedClient,
	ExistingClient,
	ExistingUserInterviewProps,
	IntegrationConfigClient,
} from '#app/utils/sort-objs'
import type {
	CommentProps,
	ExtendedCommentProps,
} from '#app/utils/suggestions.server/get-comments.js'
import { Icon } from '../ui/icon'
import { PrdComment } from './prd-comment'
export interface PrdPersonaProps {
	id: string
	personaId: string
}
export interface PersonasProps {
	personas: ExistingAndSuggestedClient[]
	prdPersonas: PrdPersonaProps[]
}

export function PRDSection({
	hasData = false,
	isOpen = false,
	name,
	prdId,
	setOpenSections,
	data: {
		context,
		backgroundInfo,
		summary,
		personas,
		risks,
		goals,
		stories,
		problems,
		success_criteria,
		features,
		userInterviews,
		designs,
		tickets,
	},
	isEditor,
	isCommenter,
	comments,
}: {
	hasData?: boolean
	isOpen?: boolean
	name: (typeof sectionNames)[number]
	prdId: string
	setOpenSections: React.Dispatch<
		React.SetStateAction<Record<(typeof sectionNames)[number], boolean>>
	>
	data: {
		context: Promise<{
			context: ExistingClient
			files: ContextFileClient[]
		}>
		backgroundInfo: Promise<ExistingClient>
		summary: Promise<ExistingClient>
		personas: Promise<PersonasProps>
		risks: Promise<ExistingAndSuggestedClient[]>
		goals: Promise<ExistingAndSuggestedClient[]>
		stories: Promise<ExistingAndSuggestedClient[]>
		problems: Promise<ExistingAndSuggestedClient[]>
		success_criteria: Promise<ExistingAndSuggestedClient[]>
		features: Promise<ExistingAndSuggestedClient[]>
		userInterviews: Promise<ExistingUserInterviewProps>
		designs: Promise<{
			links: DesignLinkClient[]
			images: DesignImageClient[]
		}>
		tickets: Promise<{
			tickets: ExistingAndSuggestedClient[]
			integrationConfig: IntegrationConfigClient
		}>
	}
	isEditor: boolean
	isCommenter: boolean
	comments: ExtendedCommentProps[]
}) {
	const [showLoader, setShowLoader] = React.useState(false)

	React.useEffect(() => {
		const timer = setTimeout(() => setShowLoader(true), 500) // 👈 show loader after 300ms
		return () => clearTimeout(timer) // cleanup if component unmounts quickly
	}, [])

	const title = name
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
	const Section = (
		<React.Suspense fallback={showLoader ? <div>Loading</div> : null}>
			<Await
				resolve={
					name === 'summary'
						? summary
						: name === 'context'
							? context
							: name === 'personas'
								? personas
								: name === 'goals'
									? goals
									: name === 'stories'
										? stories
										: name === 'risks'
											? risks
											: name === 'problems'
												? problems
												: name === 'success_criteria'
													? success_criteria
													: name === 'features'
														? features
														: name === 'user_interviews'
															? userInterviews
															: name === 'designs'
																? designs
																: name === 'tickets'
																	? tickets
																	: name === 'background_info'
																		? backgroundInfo
																		: []
				}
			>
				{(value) => {
					switch (name) {
						case 'summary':
							return (
								<SummarySection
									prdId={prdId}
									summary={value as ExistingClient}
									isEditor={isEditor}
								/>
							)
						case 'context': {
							const { context: contextData, files } = value as {
								context: ExistingClient
								files: ContextFileClient[]
							}
							return (
								<ContextSection
									prdId={prdId}
									context={contextData}
									files={files}
									isEditor={isEditor}
								/>
							)
						}
						case 'background_info': {
							return (
								<BackgroundInfoSection
									prdId={prdId}
									backgroundInfo={value as ExistingClient}
									isEditor={isEditor}
								/>
							)
						}
						case 'personas':
							return (
								<PersonasSection
									personas={(value as PersonasProps).personas}
									prdPersonas={(value as PersonasProps).prdPersonas}
									prdId={prdId}
									isEditor={isEditor}
								/>
							)
						case 'user_interviews':
							return (
								<UserInterviewSection
									userInterviews={
										(value as ExistingUserInterviewProps).userInterviews
									}
									prdId={prdId}
									prdUserInterviews={
										(value as ExistingUserInterviewProps).prdUserInterviews
									}
									isEditor={isEditor}
								/>
							)
						case 'goals':
							return (
								<GoalsSection
									goals={value as ExistingAndSuggestedClient[]}
									prdId={prdId}
									prdGoals={value as ExistingAndSuggestedClient[]}
									isEditor={isEditor}
								/>
							)
						case 'stories':
							return (
								<StoriesSection
									stories={value as ExistingAndSuggestedClient[]}
									prdId={prdId}
									prdStories={value as ExistingAndSuggestedClient[]}
									isEditor={isEditor}
								/>
							)
						case 'risks':
							return (
								<RisksSection
									risks={value as ExistingAndSuggestedClient[]}
									prdId={prdId}
									prdRisks={value as ExistingAndSuggestedClient[]}
									isEditor={isEditor}
								/>
							)
						case 'designs':
							return (
								<DesignSection
									designs={
										value as {
											links: DesignLinkClient[]
											images: DesignImageClient[]
										}
									}
									prdId={prdId}
									isEditor={isEditor}
								/>
							)
						case 'problems':
							return (
								<ProblemsSection
									problems={value as ExistingAndSuggestedClient[]}
									prdId={prdId}
									prdProblems={value as ExistingAndSuggestedClient[]}
									isEditor={isEditor}
								/>
							)
						case 'success_criteria':
							return (
								<SuccessCriteriaSection
									successCriteria={value as ExistingAndSuggestedClient[]}
									prdId={prdId}
									prdSuccessCriteria={value as ExistingAndSuggestedClient[]}
									isEditor={isEditor}
								/>
							)
						case 'features':
							return (
								<FeaturesSection
									features={value as ExistingAndSuggestedClient[]}
									prdId={prdId}
									prdFeatures={value as ExistingAndSuggestedClient[]}
									isEditor={isEditor}
								/>
							)
						case 'tickets': {
							return (
								<TicketsSection
									ticketData={
										value as {
											tickets: ExistingAndSuggestedClient[]
											integrationConfig: IntegrationConfigClient
										}
									}
									prdId={prdId}
									isEditor={isEditor}
								/>
							)
						}
						default:
							return null
					}
				}}
			</Await>
		</React.Suspense>
	)

	return (
		<div className="relative">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className="w-full flex items-center cursor-pointer hover:text-secondary-foreground/70 justify-between"
				onClick={() => {
					setOpenSections((sections) => ({
						...sections,
						[name]: !sections[name],
					}))
				}}
			>
				<div className="flex items-center space-x-2">
					<h2 className="text-lg font-semibold">{title}</h2>
					{isOpen ? (
						<Icon className="ml-1" name="chevron-down" />
					) : (
						<Icon className="ml-1" name={hasData ? 'chevron-right' : 'plus'} />
					)}
				</div>
			</div>

			<div className="mt-4" data-section={name}>
				{isOpen ? Section : null}
			</div>

			{(isEditor || isCommenter) && (
				<div className="relative top-[5px] right-0 flex justify-end">
					<PrdComment
						prdId={prdId}
						name={name}
						comments={comments.filter(
							(comment: CommentProps) => comment.objectType === name,
						)}
					/>
				</div>
			)}
		</div>
	)
}
