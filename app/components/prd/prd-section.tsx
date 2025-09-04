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
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'risks':
			SectionComponent = (
				<RisksSection
					risks={data as ExistingAndSuggestedClient[]}
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
					prdSuccessCriteria={data as ExistingAndSuggestedClient[]}
					prdId={prdId}
					isEditor={isEditor}
				/>
			)
			break
		case 'features':
			SectionComponent = (
				<FeaturesSection
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
