import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { z } from 'zod'
import { Button } from '#app/components/ui/button'
import { Field } from './forms'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const baseSchema = z.object({
	prdId: z.string(),
	integrationType: z.enum(['github', 'jira']),
})

const githubIntegration = baseSchema.extend({
	integrationType: z.literal('github'),
	githubToken: z.string(),
	githubRepo: z.string(),
})
const jiraIntegration = baseSchema.extend({
	integrationType: z.literal('jira'),
	jiraEmail: z.string(),
	jiraApiToken: z.string(),
	jiraProjectKey: z.string(),
	jiraBaseUrl: z.string(),
})

const schema = z.discriminatedUnion('integrationType', [
	githubIntegration,
	jiraIntegration,
])
export function IntegrationModal({
	open,
	onClose,
	onSuccess,
	prdId,
}: {
	open: boolean
	onClose: () => void
	onSuccess: () => void
	prdId: string
}) {
	const fetcher = useFetcher()
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [integrationType, setIntegrationType] = useState<'github' | 'jira'>(
		'github',
	)

	const [form, fields] = useForm({
		id: 'create-jira-integration',
		constraint: getZodConstraint(schema), // 👈 use your Zod schema for client-side validation
		lastResult: fetcher.data, // sync server validation errors
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		shouldValidate: 'onBlur',
	})
	const isSuccess = fetcher.data?.success

	useEffect(() => {
		if (isSuccess && !isSubmitted) {
			fetcher.data = null
			onSuccess()
			setIsSubmitted(true)
		}
	}, [isSuccess, onSuccess, isSubmitted, fetcher])

	return (
		<Dialog.Root
			open={open}
			// onOpenChange={(o) => !o && onClose()}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-black/50 fixed inset-0" />
				<Dialog.Content className="rounded-md w-full max-w-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-lg font-semibold">
								Integration Setup
							</CardTitle>
							<Button variant="ghost" onClick={onClose}>
								Close
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-4 mb-4">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="integrationType"
										value="github"
										checked={integrationType === 'github'}
										onChange={() => setIntegrationType('github')}
									/>
									GitHub
								</label>
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="integrationType"
										value="jira"
										checked={integrationType === 'jira'}
										onChange={() => setIntegrationType('jira')}
									/>
									Jira
								</label>
							</div>

							<fetcher.Form
								{...getFormProps(form)}
								method="post"
								action="/resources/setup-integration"
								// className="w-full"
								className="space-y-3"
							>
								<input name="prdId" type="hidden" value={prdId} />
								<input
									type="hidden"
									name="integrationType"
									value={integrationType}
								/>
								{integrationType === 'github' && (
									<>
										<Field
											errors={fields.githubToken.errors}
											inputProps={{
												...getInputProps(fields.githubToken, { type: 'text' }),
												autoFocus: true,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Github Token',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
										<Field
											errors={fields.githubRepo.errors}
											inputProps={{
												...getInputProps(fields.githubRepo, { type: 'text' }),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Github Repo Name',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
									</>
								)}
								{integrationType === 'jira' && (
									<>
										<Field
											errors={fields.jiraEmail.errors}
											inputProps={{
												...getInputProps(fields.jiraEmail, { type: 'text' }),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Jira Email',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
										<Field
											errors={fields.jiraApiToken.errors}
											inputProps={{
												...getInputProps(fields.jiraApiToken, { type: 'text' }),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Jira Api Token',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
										<Field
											errors={fields.jiraProjectKey.errors}
											inputProps={{
												...getInputProps(fields.jiraProjectKey, {
													type: 'text',
												}),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Jira Project Token',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
										<Field
											errors={fields.jiraBaseUrl.errors}
											inputProps={{
												...getInputProps(fields.jiraBaseUrl, { type: 'text' }),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Jira Base Url',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
									</>
								)}
								<div className="flex justify-end gap-2">
									<Button type="button" variant="ghost" onClick={onClose}>
										Cancel
									</Button>
									<Button type="submit">Save</Button>
								</div>
							</fetcher.Form>
						</CardContent>
					</Card>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
