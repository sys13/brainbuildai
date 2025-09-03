import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { marked } from 'marked'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Form, data, useActionData, useFetcher } from 'react-router'
import rehypeRaw from 'rehype-raw'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { RichTextField } from '#app/components/forms'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { getUser, requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import type { ExistingClient } from '#app/utils/sort-objs'
import getSummary from '#app/utils/suggestions.server/get-summary'
import { summary } from '#db/schema/summary'
import type { Route } from './+types/prd-context'
const schema = z.object({
	prdId: z.string(),
	textDump: z.string().optional(),
	regenerate: z.string().optional(),
})

type ActionResponse =
	| { status: 'success'; value: { textDump: string } }
	| { status: 'error'; errors: Record<string, string[]> }
export async function action({ request }: Route.ActionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return data({ status: 'error', errors: result.error }, { status: 400 })
	}

	const { prdId, textDump, regenerate } = result.value
	if (regenerate === 'true') {
		// Regenerate summary using AI
		const user = await getUser(request)
		invariantResponse(user, 'Not found', { status: 403 })
		const newSummary = await getSummary({ prdId: prdId, user, force: true })
		await db
			.insert(summary)
			.values({
				prdId,
				tenantId,
				textDump: newSummary.textDump,
			})
			.onConflictDoUpdate({
				target: [summary.prdId],
				set: { textDump: newSummary.textDump },
			})

		// Return updated summary to frontend
		return data({
			status: 'success',
			value: { textDump: newSummary.textDump },
		})
	}

	await db
		.insert(summary)
		.values({
			prdId,
			tenantId,
			textDump,
		})
		.onConflictDoUpdate({
			set: { textDump },
			target: [summary.prdId],
		})

	return data({
		status: 'success',
		value: { textDump },
	})
}
export async function smartFormatRichText(input: string): Promise<string> {
	if (!input) return ''

	const isHtml =
		input.trim().startsWith('<') &&
		(input.includes('<p') ||
			input.includes('<div') ||
			input.includes('<strong') ||
			input.includes('<ul'))

	if (isHtml) {
		return input
	}

	// Await markdown parsing
	return marked.parse(input)
}

export function SummarySection({
	prdId,
	summary,
	isEditor,
}: { prdId: string; summary: ExistingClient; isEditor: boolean }) {
	const lastResult = useActionData<ActionResponse>()
	const submit = useDebounceSubmit()
	const fetcher = useFetcher()
	const isResettingRef = useRef(false)
	const hasHandledSuccessRef = useRef(false)
	const isLoading = fetcher.state !== 'idle'
	// const html = marked(summary.textDump ?? '')
	// console.log('html', html)
	const [content, setContent] = useState('')
	const formRef = useRef<HTMLFormElement>(null)
	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'summary-section',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		defaultValue: { textDump: summary?.textDump },
		shouldRevalidate: 'onBlur',
	})

	useEffect(() => {
		const format = async () => {
			const formatted = await smartFormatRichText(summary?.textDump ?? '')
			setContent(formatted)
		}
		format()
	}, [summary?.textDump])
	useEffect(() => {
		if (!fetcher.data) return
		if (fetcher.data.status === 'success') {
			const newValue = fetcher.data.value.textDump

			if (!hasHandledSuccessRef.current && !isResettingRef.current) {
				hasHandledSuccessRef.current = true
				isResettingRef.current = true

				form.update({ name: 'textDump', value: newValue })
				setContent(newValue)
				requestAnimationFrame(() => {
					isResettingRef.current = false
					hasHandledSuccessRef.current = false
				})
			}
		} else {
			hasHandledSuccessRef.current = false
		}
	}, [fetcher.data, form])
	return (
		<div>
			{isEditor ? (
				<Form
					ref={formRef}
					method="POST"
					{...getFormProps(form)}
					action="/resources/prd-summary"
					onBlur={(event) => {
						// Skip if programmatic reset is happening
						if (isResettingRef.current) return

						// Only submit if blur happens on textarea (not random divs)
						if (event.target.name === 'textDump') {
							submit(event.currentTarget, {
								debounceTimeout: 0,
								navigate: false,
							})
						}
					}}
				>
					<input name="prdId" type="hidden" value={prdId} />
					<input type="hidden" name="textDump" value={content} />
					<RichTextField
						className="my-4"
						errors={fields.textDump.errors}
						editorProps={{
							value: content,
							onChange: (val) => setContent(val),
							onBlur: () => {
								// Trigger form submission on blur
								if (formRef.current) {
									submit(formRef.current, {
										debounceTimeout: 0,
										navigate: false,
									})
								}
							},
						}}
						labelProps={{
							children:
								'Paste Any Text Here (background, interview notes, etc.) ',
						}}
					/>
				</Form>
			) : (
				<div className="my-4 prose prose-sm max-w-none text-muted-foreground">
					<ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
				</div>
			)}
			{/* Regenerate Summary Button */}
			{isEditor && (
				<fetcher.Form method="POST" action="/resources/prd-summary">
					<input type="hidden" name="prdId" value={prdId} />
					<input type="hidden" name="regenerate" value="true" />
					<Button variant="link" type="submit" disabled={isLoading}>
						<Icon className="" name="wand-2">
							{isLoading ? 'Regenerating...' : 'Regenerate Summary'}
						</Icon>
					</Button>
				</fetcher.Form>
			)}
		</div>
	)
}
