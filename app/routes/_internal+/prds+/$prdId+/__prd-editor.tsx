import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import React from 'react'
import { useActionData, useFetcher } from 'react-router'
import { FormField } from '#app/components/form-fields-builder.js'
import { RichTextField, TextareaField } from '#app/components/forms'
import { Label } from '#app/components/ui/label.js'
import { StatusButton } from '#app/components/ui/status-button'
import { Switch } from '#app/components/ui/switch.js'
import type { Item } from '#app/utils/misc'
import { models } from '#app/utils/models'
import type { action } from './__prd-editor.server'

export const model = models.prd
export const schema = model.schema

export type RelationName = keyof typeof model.relations
export interface Props {
	defaultValues?: Partial<Record<RelationName, string[] | undefined>>
	obj?: Partial<typeof model.drizzleSchema.$inferSelect>
	relations?: Record<
		RelationName,
		{
			all: Item[]
			existing?: Item[]
		}
	>
}

export function Editor({ obj }: Props) {
	const lastResult = useActionData<typeof action>()
	const [_name, _setName] = React.useState(obj?.name ?? '')
	const [description, setDescription] = React.useState(obj?.description ?? '')
	const [context, setContext] = React.useState('')
	const fetcher = useFetcher<typeof action>()
	const fileInputRef = React.useRef<HTMLInputElement>(null)
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
	const [isDragging, setIsDragging] = React.useState(false)
	const [autoAccept, setAutoAccept] = React.useState(false)
	const isPending = fetcher.state !== 'idle'
	const [jobDone, setJobDone] = React.useState(false)
	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: `${model.name}-editor`,
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		// defaultValue: {
		// 	name: obj?.name,
		// 	description: obj?.description ?? '',
		// },
	})
	React.useEffect(() => {
		if (!jobDone) {
			const interval = setInterval(() => {
				fetcher.submit(null, {
					method: 'post',
					action: '/resources/job-status',
				})
			}, 2000)

			return () => clearInterval(interval) // cleanup on unmount
		}
	}, [jobDone, fetcher]) // only run polling if job not done
	React.useEffect(() => {
		// @ts-expect-error job status might be undefined
		if (fetcher.data?.jobStatus === 'complete') {
			setJobDone(true) // this stops polling
		}
	}, [fetcher.data])
	return (
		<div>
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				className="h-full pb-28 pt-6"
				encType="multipart/form-data"
			>
				{obj ? <input name="id" type="hidden" value={obj.id} /> : null}
				<input type="hidden" name="initialContext" value={context} />
				<input type="hidden" name="objType" value="uploadContext" />
				<input type="hidden" name="website" value="" />
				<input type="hidden" name="textDump" value={context} />
				<input
					type="hidden"
					name="autoAccept"
					value={autoAccept ? 'true' : 'false'}
				/>
				<FormField field={fields.name} inputType="input" autoFocus />
				<TextareaField
					errors={fields.description.errors}
					labelProps={{
						children: 'Short description',
						htmlFor: fields.description.id,
					}}
					textareaProps={{
						onChange: (event) => setDescription(event.currentTarget.value),
						value: description,
						...getInputProps(fields.description, { type: 'text' }),
						autoComplete: 'description',
					}}
					className="mb-4"
				/>
				<RichTextField
					className="my-4"
					errors={fields.description.errors}
					editorProps={{
						value: context,
						onChange: (val) => setContext(val),
					}}
					labelProps={{
						children: 'Context here (background, interview notes, etc.) ',
					}}
				/>

				<div className="my-2">Upload PDF (optional)</div>
				<div
					onDragOver={(e) => {
						e.preventDefault()
						setIsDragging(true)
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={(e) => {
						e.preventDefault()
						setIsDragging(false)
						const file = e.dataTransfer.files[0]
						if (file?.type === 'application/pdf') {
							const dt = new DataTransfer()
							dt.items.add(file)
							if (fileInputRef.current) {
								fileInputRef.current.files = dt.files
							}
							setSelectedFile(file)
						}
					}}
					onClick={() => fileInputRef.current?.click()}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							fileInputRef.current?.click()
						}
					}}
					className={`border-2 border-dashed rounded-md p-4 cursor-pointer text-center ${
						isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
					}`}
				>
					<p className="text-sm text-gray-500">
						Drag & drop PDF here or click to upload
					</p>
					<input
						ref={fileInputRef}
						type="file"
						name="file"
						accept="application/pdf"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0]
							setSelectedFile(file ?? null)
						}}
					/>
				</div>

				{selectedFile && (
					<p className="text-sm text-gray-600 mt-1">
						Selected File: <strong>{selectedFile.name}</strong>
					</p>
				)}
				<div className="flex items-center justify-between pt-4 border-t">
					<Label htmlFor="auto-accept-toggle">Auto Accept Mode</Label>
					<Switch
						id="auto-accept-toggle"
						checked={autoAccept}
						onCheckedChange={setAutoAccept}
					/>
				</div>
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
