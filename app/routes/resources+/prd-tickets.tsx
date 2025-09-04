import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { useEffect, useRef, useState } from 'react'
import { data, useFetcher } from 'react-router'
import { z } from 'zod'
import { Field, RichTextField } from '#app/components/forms'
import { IntegrationModal } from '#app/components/integration-modal.js'
import { ListViewItem } from '#app/components/list-view-input'
import { SuggestedItem } from '#app/components/suggested-item.js'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon.js'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { cn } from '#app/utils/misc'
import { models } from '#app/utils/models'
import type {
	ExistingAndSuggestedClient,
	IntegrationConfigClient,
} from '#app/utils/sort-objs.js'
import getTickets from '#app/utils/suggestions.server/get-tickets.js'
import { createToastHeaders } from '#app/utils/toast.server.js'
import { ticket } from '#db/schema/ticket.js'
import type { Route } from './+types/prd-personas'

const schema = z.object({
	prdId: z.string(),
	name: z.string(), // allow undefined/empty initially
	description: z.string().optional(),
	regenerate: z.coerce.boolean().optional(),
})

const model = models.ticket

export async function action({ request }: Route.ActionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const user = await getUser(request)
	invariantResponse(user, 'Not found', { status: 403 })
	const formData = await request.formData()

	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return data({ errors: result.error }, { status: 400 })
	}

	const { prdId, name, description, regenerate } = result.value
	try {
		if (regenerate) {
			const result = await getTickets({ prdId, user, regenerate })
			const headers = await createToastHeaders({
				description: 'Suggestions regenerated',
				type: 'success',
			})
			return data(
				{ success: true, regenerated: true, tickets: result },
				{ headers },
			)
		}
		// Save the ticket in DB
		await db.insert(ticket).values({
			name,
			description,
			prdId,
			tenantId,
			isAccepted: true,
			isAddedManually: true,
		})
		// const result = await getTickets({ prdId, user, regenerate })

		const headers = await createToastHeaders({
			description: `Issue added: ${name}`,
			type: 'success',
		})
		return data({ success: true, regenerated: true }, { headers })
	} catch (error) {
		console.error('Error inserting designLink:', error)
		return data({ errors: ['Invalid file upload'] }, { status: 400 })
	}
}

export function TicketsSection({
	prdId,
	ticketData,
	isEditor,
}: {
	prdId: string
	ticketData: {
		tickets: ExistingAndSuggestedClient[]
		integrationConfig: IntegrationConfigClient
	}
	isEditor: boolean
}) {
	const fetcher = useFetcher()
	const [showModal, setShowModal] = useState(false)
	const formRef = useRef<HTMLFormElement>(null)
	const [bypassCheck, setBypassCheck] = useState(false)
	const [content, setContent] = useState('')
	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'tickets-section',
		lastResult: fetcher.data,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		shouldRevalidate: 'onSubmit',
	})

	useEffect(() => {
		if (fetcher.data) {
			if (fetcher.data.success) {
				setContent('')
			}
		}
	}, [fetcher])

	const handlePushAllToGithub = () => {
		fetcher.submit(
			{ prdId, target: 'github' },
			{
				method: 'POST',
				action: '/resources/export-ticket',
			},
		)
	}

	const handlePushAllToJira = () => {
		fetcher.submit(
			{ prdId, target: 'jira' },
			{
				method: 'POST',
				action: '/resources/export-ticket',
			},
		)
	}
	const isIntegrationMissing =
		!ticketData.integrationConfig?.githubToken ||
		!ticketData.integrationConfig?.githubRepo ||
		!ticketData.integrationConfig?.jiraEmail ||
		!ticketData.integrationConfig?.jiraApiToken ||
		!ticketData.integrationConfig?.jiraProjectKey ||
		!ticketData.integrationConfig?.jiraBaseUrl

	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		if (!isIntegrationMissing && !bypassCheck) {
			e.preventDefault()
			setShowModal(true)
		}
	}

	const handleModalConfirm = () => {
		setShowModal(false)
		setBypassCheck(true)
	}
	useEffect(() => {
		if (bypassCheck) {
			formRef.current?.requestSubmit()
			setBypassCheck(false)
		}
	}, [bypassCheck])

	const accepted = ticketData.tickets.filter((item) => item.isAccepted)
	const suggested = ticketData.tickets.filter((item) => !item.isAccepted)
	return (
		<div>
			<IntegrationModal
				open={showModal}
				onClose={() => setShowModal(false)}
				prdId={prdId}
				onSuccess={handleModalConfirm}
			/>
			{isEditor && (
				<div>
					{ticketData.integrationConfig?.githubToken ||
					ticketData.integrationConfig?.jiraApiToken ? (
						<>
							<div>Add a new ticket below:</div>
							<fetcher.Form
								{...getFormProps(form)}
								ref={formRef}
								method="post"
								action="/resources/prd-tickets"
								className="mb-2"
								onSubmit={handleFormSubmit}
							>
								<input name="prdId" type="hidden" value={prdId} />
								<input name="description" type="hidden" value={content} />
								<div className="flex flex-col gap-2">
									<Field
										errors={fields.name.errors}
										inputProps={{
											...getInputProps(fields.name, { type: 'text' }),
											autoFocus: true,
											className:
												'focus-visible:ring-1 focus-within:ring-0 ring-offset-0',
											placeholder: 'Title',
										}}
										labelProps={{ children: '' }}
										noErrorMin
									/>
									<RichTextField
										className="my-4"
										errors={fields.description.errors}
										editorProps={{
											value: content,
											onChange: (val) => setContent(val),
										}}
										labelProps={{
											children: 'Description',
										}}
									/>
									<Button
										className="h-11 px-10 self-start"
										variant="outline"
										type="submit"
									>
										Create
									</Button>
								</div>
							</fetcher.Form>
						</>
					) : (
						<div className="my-10 flex flex-col items-start justify-start text-left">
							<p className="text-sm text-muted-foreground mb-2">
								Setup GitHub or Jira integration to create tickets.
							</p>
							<Button variant="default" onClick={() => setShowModal(true)}>
								<Icon className="mb-0.5 mr-2" name="plug" /> Setup Integration
							</Button>
						</div>
					)}
				</div>
			)}

			{!isEditor && accepted.length === 0 && (
				<p className="text-muted-foreground italic mb-4">
					No tickets added yet.
				</p>
			)}

			<ul className={cn('space-y-2', !isEditor && 'list-inside list-disc')}>
				{accepted.map((ticket) =>
					isEditor ? (
						<ListViewItem
							item={ticket}
							key={ticket.id}
							model={model}
							prdId={prdId}
							linkToDetails
						/>
					) : (
						<li key={ticket.id}>{ticket.name}</li>
					),
				)}
			</ul>

			{isEditor && accepted.length > 0 && (
				<div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
					{ticketData.integrationConfig?.githubToken && (
						<Button variant="outline" onClick={handlePushAllToGithub}>
							Push All to GitHub
						</Button>
					)}
					{ticketData.integrationConfig?.jiraApiToken && (
						<Button variant="outline" onClick={handlePushAllToJira}>
							Push All to Jira
						</Button>
					)}
				</div>
			)}
			{isEditor && suggested.length > 0 && (
				<>
					<div className="mt-4 mb-2 flex items-center justify-between">
						<h2 className="text-sm font-bold">Suggested</h2>
						<Button
							variant="ghost"
							onClick={() =>
								fetcher.submit(
									{ prdId, regenerate: 'true', name: 'regenerate' },
									{ method: 'POST', action: '/resources/prd-tickets' },
								)
							}
						>
							🔁 Regenerate Suggestions
						</Button>
					</div>
					<ul className="space-y-2 @2xl:space-y-0 @2xl:gap-4 @2xl:grid @2xl:grid-cols-2">
						{suggested.map((ticket) => (
							<SuggestedItem
								item={ticket}
								key={ticket.id}
								objType={model.name}
								prdId={prdId}
							/>
						))}
					</ul>
				</>
			)}
		</div>
	)
}
