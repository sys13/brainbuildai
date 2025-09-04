import type {
	SectionDataType,
	SectionsData,
	sectionNames,
} from '#app/routes/_internal+/prds+/$prdId+/_prd_id.index'
import { BackgroundInfoSection } from '#app/routes/resources+/prd-background-info.js'
import { DesignSection } from '#app/routes/resources+/prd-design.js'
import { FeaturesSection } from '#app/routes/resources+/prd-features.js'
import { GoalsSection } from '#app/routes/resources+/prd-goals.js'
import { PersonasSection } from '#app/routes/resources+/prd-personas.js'
import { ProblemsSection } from '#app/routes/resources+/prd-problems.js'
import { RisksSection } from '#app/routes/resources+/prd-risks.js'
import { StoriesSection } from '#app/routes/resources+/prd-stories.js'
import { SuccessCriteriaSection } from '#app/routes/resources+/prd-success-criteria.js'
import { SummarySection } from '#app/routes/resources+/prd-summary.js'
import { TicketsSection } from '#app/routes/resources+/prd-tickets.js'
import { UserInterviewSection } from '#app/routes/resources+/prd-user-interviews.js'
import type {
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
import React from 'react'
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

export function PRDSection<K extends keyof SectionsData>({
	hasData = false,
	isOpen = false,
	name,
	prdId,
	setOpenSections,
	data,
	isEditor,
	isCommenter,
	comments,
}: {
	hasData?: boolean
	isOpen?: boolean
	name: K
	prdId: string
	setOpenSections: React.Dispatch<
		React.SetStateAction<Record<(typeof sectionNames)[number], boolean>>
	>
	data: SectionDataType<K>
	isEditor: boolean
	isCommenter: boolean
	comments: ExtendedCommentProps[]
}) {
	const [_showLoader, setShowLoader] = React.useState(false)

	React.useEffect(() => {
		const timer = setTimeout(() => setShowLoader(true), 500) // 👈 show loader after 300ms
		return () => clearTimeout(timer) // cleanup if component unmounts quickly
	}, [])

	const title = name
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
	let SectionComponent: React.ReactNode = null
	switch (name) {
		case 'summary':
			SectionComponent = (
				<SummarySection
					prdId={prdId}
					summary={data as ExistingClient}
					isEditor={isEditor}
				/>
			)
			break
		// case 'context': {
		// 	const { context: contextData, files } = data
		// 	SectionComponent = (
		// 		<ContextSection
		// 			prdId={prdId}
		// 			context={contextData}
		// 			files={files}
		// 			isEditor={isEditor}
		// 		/>
		// 	)
		// 	break
		// }
		case 'background_info':
			SectionComponent = (
				<BackgroundInfoSection
					prdId={prdId}
					backgroundInfo={data as ExistingClient}
					isEditor={isEditor}
				/>
			)
			break
		case 'personas': {
			const { personas, prdPersonas } = data as PersonasProps
			SectionComponent = (
				<PersonasSection
					personas={personas}
					prdPersonas={prdPersonas}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		}
		case 'user_interviews': {
			const { userInterviews, prdUserInterviews } =
				data as ExistingUserInterviewProps
			SectionComponent = (
				<UserInterviewSection
					userInterviews={userInterviews}
					prdUserInterviews={prdUserInterviews}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		}
		case 'goals':
			SectionComponent = (
				<GoalsSection
					goals={data as ExistingAndSuggestedClient[]}
					prdGoals={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'stories':
			SectionComponent = (
				<StoriesSection
					stories={data as ExistingAndSuggestedClient[]}
					prdStories={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'risks':
			SectionComponent = (
				<RisksSection
					risks={data as ExistingAndSuggestedClient[]}
					prdRisks={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'designs':
			SectionComponent = (
				<DesignSection
					designs={
						data as {
							links: DesignLinkClient[]
							images: DesignImageClient[]
						}
					}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'problems':
			SectionComponent = (
				<ProblemsSection
					problems={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'success_criteria':
			SectionComponent = (
				<SuccessCriteriaSection
					successCriteria={data as ExistingAndSuggestedClient[]}
					prdSuccessCriteria={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'features':
			SectionComponent = (
				<FeaturesSection
					features={data as ExistingAndSuggestedClient[]}
					prdFeatures={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'tickets': {
			SectionComponent = (
				<TicketsSection
					ticketData={
						data as {
							tickets: ExistingAndSuggestedClient[]
							integrationConfig: IntegrationConfigClient
						}
					}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		}
		default:
			SectionComponent = null
	}

	// const Section = (
	// 	<React.Suspense fallback={showLoader ? <div>Loading</div> : null}>
	// 		<Await
	// 			resolve={
	// 				name === 'summary'
	// 					? summary
	// 					: name === 'context'
	// 						? context
	// 						: name === 'personas'
	// 							? personas
	// 							: name === 'goals'
	// 								? goals
	// 								: name === 'stories'
	// 									? stories
	// 									: name === 'risks'
	// 										? risks
	// 										: name === 'problems'
	// 											? problems
	// 											: name === 'success_criteria'
	// 												? success_criteria
	// 												: name === 'features'
	// 													? features
	// 													: name === 'user_interviews'
	// 														? userInterviews
	// 														: name === 'designs'
	// 															? designs
	// 															: name === 'tickets'
	// 																? tickets
	// 																: name === 'background_info'
	// 																	? backgroundInfo
	// 																	: []
	// 			}
	// 		>
	// 			{(value) => {
	// 				switch (name) {
	// 					case 'summary':
	// 						return (
	// 							<SummarySection
	// 								prdId={prdId}
	// 								summary={value as ExistingClient}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'context': {
	// 						const { context: contextData, files } = value as {
	// 							context: ExistingClient
	// 							files: ContextFileClient[]
	// 						}
	// 						return (
	// 							<ContextSection
	// 								prdId={prdId}
	// 								context={contextData}
	// 								files={files}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					}
	// 					case 'background_info': {
	// 						return (
	// 							<BackgroundInfoSection
	// 								prdId={prdId}
	// 								backgroundInfo={value as ExistingClient}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					}
	// 					case 'personas':
	// 						return (
	// 							<PersonasSection
	// 								personas={(value as PersonasProps).personas}
	// 								prdPersonas={(value as PersonasProps).prdPersonas}
	// 								prdId={prdId}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'user_interviews':
	// 						return (
	// 							<UserInterviewSection
	// 								userInterviews={
	// 									(value as ExistingUserInterviewProps).userInterviews
	// 								}
	// 								prdId={prdId}
	// 								prdUserInterviews={
	// 									(value as ExistingUserInterviewProps).prdUserInterviews
	// 								}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'goals':
	// 						return (
	// 							<GoalsSection
	// 								goals={value as ExistingAndSuggestedClient[]}
	// 								prdId={prdId}
	// 								prdGoals={value as ExistingAndSuggestedClient[]}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'stories':
	// 						return (
	// 							<StoriesSection
	// 								stories={value as ExistingAndSuggestedClient[]}
	// 								prdId={prdId}
	// 								prdStories={value as ExistingAndSuggestedClient[]}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'risks':
	// 						return (
	// 							<RisksSection
	// 								risks={value as ExistingAndSuggestedClient[]}
	// 								prdId={prdId}
	// 								prdRisks={value as ExistingAndSuggestedClient[]}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'designs':
	// 						return (
	// 							<DesignSection
	// 								designs={
	// 									value as {
	// 										links: DesignLinkClient[]
	// 										images: DesignImageClient[]
	// 									}
	// 								}
	// 								prdId={prdId}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'problems':
	// 						return (
	// 							<ProblemsSection
	// 								problems={value as ExistingAndSuggestedClient[]}
	// 								prdId={prdId}
	// 								prdProblems={value as ExistingAndSuggestedClient[]}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'success_criteria':
	// 						return (
	// 							<SuccessCriteriaSection
	// 								successCriteria={value as ExistingAndSuggestedClient[]}
	// 								prdId={prdId}
	// 								prdSuccessCriteria={value as ExistingAndSuggestedClient[]}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'features':
	// 						return (
	// 							<FeaturesSection
	// 								features={value as ExistingAndSuggestedClient[]}
	// 								prdId={prdId}
	// 								prdFeatures={value as ExistingAndSuggestedClient[]}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					case 'tickets': {
	// 						return (
	// 							<TicketsSection
	// 								ticketData={
	// 									value as {
	// 										tickets: ExistingAndSuggestedClient[]
	// 										integrationConfig: IntegrationConfigClient
	// 									}
	// 								}
	// 								prdId={prdId}
	// 								isEditor={isEditor}
	// 							/>
	// 						)
	// 					}
	// 					default:
	// 						return null
	// 				}
	// 			}}
	// 		</Await>
	// 	</React.Suspense>
	// )

	return (
		<div className="relative">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: misc */}
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
				{isOpen ? SectionComponent : null}
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
