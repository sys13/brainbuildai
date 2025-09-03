import { invariant } from '@epic-web/invariant'
import { useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { Form, useLoaderData, useSubmit } from 'react-router'
import { Spacer } from '#app/components/spacer'
import { Button } from '#app/components/ui/button'
import { Label } from '#app/components/ui/label'
import { Textarea } from '#app/components/ui/textarea'
import { requireInternalUser } from '#app/utils/auth.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireInternalUser(request)
	const { id: prdId } = params
	invariant(prdId, 'prdId is required')

	return { prdId }
}

export default function WizardStart() {
	const { prdId } = useLoaderData<typeof loader>()
	const [addText, setAddText] = useState('')
	const submit = useSubmit()
	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-md">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Let's Start</h1>
					<p className="text-body-md text-muted-foreground line-clamp-2">
						What do you want to build?
					</p>
				</div>
				<Spacer size="2xs" />

				<div className="mx-auto w-full max-w-md px-8">
					<div className="mb-4">
						<Form
							onSubmit={(event) => {
								event.preventDefault()
								const target = event.currentTarget

								const formData = new FormData(target)
								formData.append('prdId', prdId)
								submit(formData, {
									action: '/resources/set-what-to-build',
									method: 'post',
									navigate: true,
								})
							}}
						>
							<Label htmlFor="whatToBuild">What to build</Label>
							<Textarea
								id="whatToBuild"
								name="name"
								onChange={(e) => setAddText(e.target.value)}
								placeholder="A short description of your project"
								required
								value={addText}
							/>
							<div className="flex justify-end">
								<Button className="mt-4" type="submit">
									Next
								</Button>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</div>
	)
}
