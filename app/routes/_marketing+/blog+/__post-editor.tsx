import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useActionData, useFetcher } from 'react-router'
import { z } from 'zod'
import { FormField } from '#app/components/form-fields-builder'
import { StatusButton } from '#app/components/ui/status-button'
import { cn } from '#app/utils/misc'
import { schemas } from '#app/utils/modelUtils'
import { post } from '#db/schema/blog/post'
import type { action } from './__post-editor.server'

export const schema = z.object({
	content: z.string(),
	id: schemas.id,
	metaDescription: z.string(),
	metaKeywords: z.string(),
	metaTitle: z.string(),
	name: z.string(),
	publishedAt: z.date(),
	slug: z.string(),
	status: z.enum(['draft', 'published']),
})

export const model = {
	drizzleSchema: post,
	name: 'post',
}

export interface Props {
	className?: string
	obj?: Partial<typeof model.drizzleSchema.$inferSelect>
}

export function Editor({ className, obj }: Props) {
	const lastResult = useActionData<typeof action>()
	const fetcher = useFetcher<typeof action>()
	const isPending = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		defaultValue: {
			content: obj?.content ?? '',
			metaDescription: obj?.metaDescription ?? '',
			metaKeywords: obj?.metaKeywords ?? '',
			metaTitle: obj?.metaTitle ?? '',
			name: obj?.name,
			publishedAt: obj?.publishedAt ?? new Date(),
			slug: obj?.slug ?? '',
			status: obj?.status ?? 'draft',
		},
		id: `${model.name}-editor`,
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})

	return (
		<div className={cn('h-full pb-28 pt-6', className)}>
			<fetcher.Form method="post" {...getFormProps(form)} className="w-full">
				{obj ? <input name="id" type="hidden" value={obj.id} /> : null}

				<FormField field={fields.name} inputType="input" />
				<FormField field={fields.slug} inputType="input" />
				<FormField field={fields.content} inputType="textarea" />
				<FormField field={fields.metaTitle} inputType="input" />
				<FormField field={fields.metaDescription} inputType="input" />
				<FormField field={fields.metaKeywords} inputType="input" />
				<FormField field={fields.status} inputType="input" />

				<div className="mt-4 flex justify-end gap-x-2">
					<StatusButton
						disabled={isPending}
						form={form.id}
						status={isPending ? 'pending' : 'idle'}
						type="submit"
					>
						Submit
					</StatusButton>
				</div>
			</fetcher.Form>
		</div>
	)
}
