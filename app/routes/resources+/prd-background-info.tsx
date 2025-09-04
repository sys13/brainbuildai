import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { data, Form, useActionData } from 'react-router'
import rehypeRaw from 'rehype-raw'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { RichTextField } from '#app/components/forms'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import type { ExistingClient } from '#app/utils/sort-objs'
import { backgroundInfo } from '#db/schema/backgroundInfo'
import type { Route } from './+types/prd-background-info'

const schema = z.object({
	prdId: z.string(),
	textDump: z.string().default(''),
})

type ActionResponse =
	| { status: 'success'; value: { textDump: string } }
	| { status: 'error'; errors: Record<string, string[]> }
export async function action({ request }: Route.ActionArgs) {
	const { tenantId, id } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return data({ errors: result.error }, { status: 400 })
	}

	const response = result.value

	const { prdId, textDump } = response
	if (textDump?.trim()) {
		await db
			.insert(backgroundInfo)
			.values({
				prdId,
				tenantId,
				textDump,
			})
			.onConflictDoUpdate({
				set: { textDump },
				target: [backgroundInfo.prdId],
			})
	}
	return data({
		status: 'success',
		value: { textDump: textDump?.trim() ?? '' },
	})
}

export function BackgroundInfoSection({
	prdId,
	backgroundInfo,
	isEditor,
}: {
	prdId: string
	backgroundInfo: ExistingClient
	isEditor: boolean
}) {
	const lastResult = useActionData<ActionResponse>()
	const submit = useDebounceSubmit()
	const [content, setContent] = useState(backgroundInfo?.textDump ?? '')
	const formRef = useRef<HTMLFormElement>(null)

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'context-section',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		defaultValue: { textDump: backgroundInfo?.textDump },
		shouldRevalidate: 'onBlur',
	})

	if (!isEditor) {
		// Read-only view
		return (
			<div className="my-4 prose prose-sm max-w-none text-muted-foreground">
				{content?.trim() ? (
					<ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
				) : (
					<p className="italic text-muted-foreground">
						No background info added yet.
					</p>
				)}
			</div>
		)
	}

	return (
		<div>
			<Form
				ref={formRef}
				method="POST"
				{...getFormProps(form)}
				action="/resources/prd-background-info"
				onBlur={(event) => {
					if (event.target.name === 'textDump') {
						submit(event.currentTarget, {
							debounceTimeout: 0,
							navigate: false,
						})
					}
				}}
			>
				<input name="prdId" type="hidden" value={prdId} />
				<input type="hidden" name="website" value="" />
				<input type="hidden" name="textDump" value={content} />
				<RichTextField
					className="my-4"
					errors={fields.textDump.errors}
					editorProps={{
						value: content,
						onChange: (val) => setContent(val),
						onBlur: () => {
							if (formRef.current) {
								submit(formRef.current, {
									debounceTimeout: 0,
									navigate: false,
								})
							}
						},
					}}
					labelProps={{
						children: 'Current state and background info',
					}}
				/>
			</Form>
		</div>
	)
}
