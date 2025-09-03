import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Form, useActionData } from 'react-router'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { TextareaField } from '#app/components/forms'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { context } from '#db/schema/context'
import type { Route } from './+types/prd-context'

const schema = z.object({
	prdId: z.string(),
	textDump: z.string().default(''),
	website: z.string().url().default(''),
})

export async function action({ request }: Route.ActionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { prdId, textDump, website } = result.value

	await db
		.insert(context)
		.values({
			prdId,
			tenantId,
			textDump,
			website,
		})
		.onConflictDoUpdate({
			set: { textDump, website },
			target: [context.prdId],
		})

	return result.reply()
}

export function ExecSummarySection({ prdId }: { prdId: string }) {
	const lastResult = useActionData<typeof action>()
	const submit = useDebounceSubmit()
	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'exec-summary-section',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},

		shouldRevalidate: 'onBlur',
	})
	return (
		<div>
			<Form
				method="POST"
				{...getFormProps(form)}
				action="/resources/prd-context"
				onBlur={(event) => {
					submit(event.currentTarget, { debounceTimeout: 0, navigate: false })
				}}
			>
				<input name="prdId" type="hidden" value={prdId} />
				{/* <Field
					errors={fields.website.errors}
					inputProps={{
						...getInputProps(fields.website, { type: 'url' }),
						autoFocus: true,
						className: 'lowercase',
						placeholder: 'https://example.com ',
					}}
					labelProps={{ children: 'Product Website' }}
				/> */}
				<TextareaField
					errors={fields.textDump.errors}
					labelProps={{
						children:
							'Paste Any Text Here (background, interview notes, etc.) ',
					}}
					textareaProps={{
						...getTextareaProps(fields.textDump),
					}}
				/>
			</Form>
		</div>
	)
}
