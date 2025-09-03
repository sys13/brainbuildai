import { invariantResponse } from '@epic-web/invariant'
import { useEffect, useState } from 'react'
import { AIInstructionsModal } from '#app/components/ai-Instructions-modal.js'
import { Heading } from '#app/components/heading'
import {
	type PersonasProps,
	PrdExport,
} from '#app/components/prd/prd-export.js'
import { ModeType, PrdModeSection } from '#app/components/prd/prd-mode.js'
import { PRDSection } from '#app/components/prd/prd-section.js'
import {
	type ShareOptionsProps,
	ShareSection,
} from '#app/components/prd/prd-share'
import { Spacer } from '#app/components/spacer'
import { Button } from '#app/components/ui/button.js'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { requireAuthorization } from '#app/models/authorization.server'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { getAllPrdData } from '#app/utils/get-all-prd-data.server.js'
import getPermission from '#app/utils/get-permission'
import { models } from '#app/utils/models'
import type {
	ContextFileClient,
	DesignImageClient,
	DesignLinkClient,
	ExistingAndSuggestedClient,
	ExistingClient,
	ExistingUserInterviewProps,
	IntegrationConfigClient,
} from '#app/utils/sort-objs.js'
import getComments from '#app/utils/suggestions.server/get-comments'
import getShareOptions from '#app/utils/suggestions.server/get-share'
import type { Route } from './+types/_prd_id.index'
const model = models.prd

export const loader = async ({ params, request }: Route.LoaderArgs) => {
	const { tenantId } = await requireInternalUser(request)
	const user = await getUser(request)
	invariantResponse(user, 'Not found', { status: 403 })

	const { prdId: id } = params
	invariantResponse(id, 'Not found', { status: 404 })

	const privileges = await requireAuthorization({
		id,
		modelName: model.name,
		operation: 'read',
		user,
	})

	// const withFilter = {
	// 	columns: { id: true, name: true },
	// 	where: filterByProjectAccepted({ prdId: id, tenantId }),
	// } as const
	let { isReader, isCommenter, isEditor } = await getPermission({
		id,
		user,
	})

	const rawObj = await db.query.prd.findFirst({
		where: { id, ...(!isReader ? { tenantId } : {}) },
		// personas: withFilter,
	})
	const share = await getShareOptions({ prdId: id, user })
	if (user.id === rawObj?.ownerId) {
		isEditor = true
		isCommenter = true
		isReader = true
		share.isEditor = true
		share.isCommenter = true
		share.isReader = true
	}
	const comments = await getComments({ prdId: id })
	invariantResponse(rawObj, 'Not found', { status: 404 })
	return {
		obj: rawObj,
		share,
		data: getAllPrdData({ prdId: id, user }),
		isEditor,
		isCommenter,
		comments,
	}
}

// export const action = deleteAction.bind(null, model)
const sectionOrder: SectionName[] = [
	'context',
	'background_info',
	'personas',
	'problems',
	'goals',
	'success_criteria',
	'features',
	'stories',
	'user_interviews',
	'designs',
	'risks',
	'tickets',
	'summary',
]

export default function Details({ loaderData }: Route.ComponentProps) {
	const { obj, data, share, isEditor, isCommenter, comments } = loaderData
	const [openSections, setOpenSections] = useState<
		Record<(typeof sectionNames)[number], boolean>
	>(() => {
		const defaultOpen: Record<(typeof sectionNames)[number], boolean> = {
			summary: true,
			context: true,
			background_info: true,
			personas: true,
			goals: true,
			stories: true,
			risks: true,
			problems: true,
			features: true,
			success_criteria: true,
			user_interviews: true,
			designs: true,
			tickets: true,
		}

		// Open all sections if in view mode
		if (!isEditor) {
			for (const key in defaultOpen) {
				defaultOpen[key as keyof typeof defaultOpen] = true
			}
		}

		return defaultOpen
	})
	const [sections, setSections] = useState<SectionsData>({})
	const [loadingIndex, setLoadingIndex] = useState(0)
	useEffect(() => {
		if (loadingIndex >= sectionOrder.length) return

		const sectionName = sectionOrder[loadingIndex]
		fetch(`/prds/${obj.id}/sections/${sectionName}`)
			.then((res) => res.json())
			.then((data) => {
				setSections((prev) => ({ ...prev, [sectionName]: data }))
				setLoadingIndex((prev) => prev + 1) // proceed to next
			})
			.catch((err) => console.log('err', err))
	}, [loadingIndex, obj])
	const [hasDataSections, setHasDataSections] = useState<
		Record<(typeof sectionNames)[number], boolean>
	>({
		summary: false,
		context: true,
		background_info: true,
		personas: false,
		goals: false,
		stories: false,
		risks: false,
		problems: false,
		features: false,
		success_criteria: false,
		user_interviews: false,
		designs: false,
		tickets: false,
	})
	const [mode, setMode] = useState<ModeType>(
		isEditor ? ModeType.editing : ModeType.viewing,
	)
	const [aiModalOpen, setAiModalOpen] = useState(false)
	useEffect(() => {
		if (mode === ModeType.viewing) {
			setOpenSections((prev) => {
				const updated: Record<(typeof sectionNames)[number], boolean> = {
					...prev,
				}
				for (const key in updated) {
					updated[key as keyof typeof updated] = true
				}
				return updated
			})
		}
	}, [mode])

	const prdSectionProps = {
		prdId: obj.id,
		setHasDataSections,
		setOpenSections,
		data,
		isEditor:
			(share as ShareOptionsProps).isEditor && mode === ModeType.editing,
		isCommenter,
		comments,
	}
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>
						<Heading
							canDelete={false}
							canEdit={mode === ModeType.editing}
							id={obj.id}
							model={model}
							name={obj.name}
							noBreadcrumbs
							noHome
							permissions={[]}
							prdId=""
							rightButtons={
								<div className="flex flex-col sm:flex-row gap-2">
									{isEditor && (
										<div className="flex flex-col sm:flex-row gap-2">
											{mode === ModeType.editing && (
												<Button
													variant="secondary"
													onClick={() => setAiModalOpen(true)}
												>
													Context
												</Button>
											)}
											<ShareSection
												prdId={obj.id}
												name={obj.name}
												shareOptions={share as ShareOptionsProps}
											/>
											<PrdExport prdId={obj.id} data={data} name={obj.name} />
										</div>
									)}
									<PrdModeSection
										prdId={obj.id}
										mode={mode}
										setMode={setMode}
										isEditor={isEditor}
									/>
								</div>
							}
							type="details"
							mode={mode}
						/>
					</CardTitle>
				</CardHeader>
			</Card>
			<AIInstructionsModal
				open={aiModalOpen}
				onClose={() => setAiModalOpen(false)}
				onSuccess={() => {
					// Refresh data or show success message
				}}
				prdId={prdSectionProps.prdId}
				autoAccept={obj.autoAccept ?? false}
				contextPromise={prdSectionProps.data.context}
			/>
			<Spacer size="4xs" />
			<div className="space-y-2 mb-10">
				{/* <div className="bg-white p-[15px_20px] rounded-[5px] shadow-[0px_1px_2px_0px_#0000000D]">
					<PRDSection
						{...prdSectionProps}
						hasData={hasDataSections.context}
						isOpen={openSections.context}
						name="context"
						isEditor={(share as ShareOptionsProps).isEditor}
					/>
				</div> */}
				{sectionOrder.slice(0, loadingIndex).map((section) => (
					<Card key={section}>
						<CardContent>
							<PRDSection
								key={section}
								name={section}
								prdId={obj.id}
								isOpen={openSections[section]}
								setOpenSections={setOpenSections}
								data={sections[section] as SectionDataType<typeof section>}
								hasData={!!sections[section]}
								isEditor={
									(share as ShareOptionsProps).isEditor &&
									mode === ModeType.editing
								}
								isCommenter={isCommenter}
								comments={comments}
							/>
						</CardContent>
					</Card>
				))}

				{/* <Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={hasDataSections.background_info}
							isOpen={openSections.background_info}
							name="background_info"
							// isEditor={(share as ShareOptionsProps).isEditor}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.personas}
							name="personas"
							// isEditor={(share as ShareOptionsProps).isEditor}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.problems}
							name="problems"
							// isEditor={(share as ShareOptionsProps).isEditor}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.user_interviews}
							name="user_interviews"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.goals}
							name="goals"
							// isEditor={(share as ShareOptionsProps).isEditor}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.stories}
							name="stories"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.success_criteria}
							name="success_criteria"
							// isEditor={(share as ShareOptionsProps).isEditor}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.risks}
							name="risks"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.features}
							name="features"
							// isEditor={(share as ShareOptionsProps).isEditor}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.designs}
							name="designs"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<PRDSection
							{...prdSectionProps}
							hasData={true}
							isOpen={openSections.tickets}
							name="tickets"
						/>
					</CardContent>
				</Card> */}
			</div>
		</>
	)
}

export const sectionNames = [
	'summary',
	'context',
	'background_info',
	'personas',
	'risks',
	'goals',
	'stories',
	'problems',
	'success_criteria',
	'features',
	'user_interviews',
	'designs',
	'tickets',
] as const
export type SectionName = (typeof sectionNames)[number]

export type SectionsData = {
	context?: {
		context: ExistingClient
		files: ContextFileClient[]
	}
	background_info?: ExistingClient
	summary?: ExistingClient
	personas?: PersonasProps
	risks?: ExistingAndSuggestedClient[]
	goals?: ExistingAndSuggestedClient[]
	stories?: ExistingAndSuggestedClient[]
	problems?: ExistingAndSuggestedClient[]
	success_criteria?: ExistingAndSuggestedClient[]
	features?: ExistingAndSuggestedClient[]
	user_interviews?: ExistingUserInterviewProps
	designs?: {
		links: DesignLinkClient[]
		images: DesignImageClient[]
	}
	tickets?: {
		tickets: ExistingAndSuggestedClient[]
		integrationConfig: IntegrationConfigClient
	}
}

export type SectionDataType<T extends keyof SectionsData> = SectionsData[T]
