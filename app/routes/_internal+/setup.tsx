import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { redirect, useActionData, useFetcher } from 'react-router'
import { z } from 'zod'
import { FormField } from '#app/components/form-fields-builder'
import { Heading } from '#app/components/heading'
import { StatusButton } from '#app/components/ui/status-button'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { parseWebsite } from '#app/utils/parseWebsite'
import { tenant } from '#db/schema/base'
import { job } from '#db/schema/job'
import type { Route } from './+types/setup'

export const schema = z.object({
	companyWebsite: z.string().optional(),
})

export async function action({ request }: Route.ActionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, {
		schema: schema.superRefine((data, ctx) => {
			// check if the companyWebsite is a valid URL with or without http(s)://
			// it doesn't have to have the protocol, but it should be a valid URL
			if (
				data.companyWebsite &&
				!/^(https?:\/\/)?[^\s/$.?#].[^\s]*$/.test(data.companyWebsite)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid URL',
				})
				return
			}
		}),
	})

	if (result.status !== 'success') {
		return result.reply()
	}

	const { companyWebsite } = result.value

	if (!companyWebsite) {
		await db.update(tenant).set({
			completedOnboarding: true,
		})
		return redirect('/dashboard')
	}

	await db.transaction(async (tx) => {
		await tx.update(tenant).set({
			companyWebsite,
		})

		const jobId = (
			await tx
				.insert(job)
				.values({
					tenantId,
					name: 'setup',
					status: 'pending',
					jobType: 'parseWebsite',
					data: {
						companyWebsite,
					},
				})
				.returning({ id: job.id })
		)[0].id
		parseWebsite({ jobId, companyWebsite, tenantId })
	})

	return redirect('/status')
}

export default function Editor() {
	const lastResult = useActionData<typeof action>()
	const fetcher = useFetcher<typeof action>()
	const isPending = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'setup',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		// defaultValue: {
		// 	name: obj?.name,
		// 	description: obj?.description ?? '',
		// },
	})

	return (
		<div>
			<Heading title="Setup" />
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				className="h-full pb-28 pt-6"
			>
				<FormField
					field={fields.companyWebsite}
					inputType="input"
					autoFocus
					placeholder="e.g. https://yourcompany.com — helps tailor your PRD"
				/>
				{/* 👇 Helper text */}
				<p className="text-sm text-gray-500">
					We use this to understand how your product is positioned, what it
					does, and how you talk about it. This helps us generate PRDs that are
					tailored to your product — not just generic templates.
				</p>

				{/* <TextareaField
					errors={fields.name.errors}
					labelProps={{
						children: 'What kind of feature do you want to create?',
						htmlFor: fields.name.id,
					}}
					textareaProps={{
						onChange: (event) => setName(event.currentTarget.value),
						value: name,
						...getInputProps(fields.name, { type: 'text' }),
						autoComplete: 'name',
						autoFocus: true,
					}}
				/> */}

				{/* <FormField
					field={fields.description}
					inputType="textarea"
					placeholder="Describe the problem your project is trying to solve"
				/> */}

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
