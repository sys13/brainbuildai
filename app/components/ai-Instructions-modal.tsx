import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as Dialog from '@radix-ui/react-dialog'
import React, { Suspense, useRef, useState } from 'react'
import { Await, useFetcher } from 'react-router'
import { z } from 'zod'
import { Button } from '#app/components/ui/button'
import type { ContextFileClient, ExistingClient } from '#app/utils/sort-objs.js'
import { RichTextField, TextareaField } from './forms'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

const schema = z.object({
	prdId: z.string(),
	textDump: z.string(),
	systemPrompt: z.string().optional(), // Include if you're storing it separately
	objType: z.literal('uploadContext'),
	website: z.string().optional(),
	file: z
		.instanceof(File)
		.refine((file) => file.size > 0 && file.type === 'application/pdf', {
			message: 'Only PDF files are allowed',
		})
		.optional(),
	autoAccept: z
		.union([z.literal('true'), z.literal('false')])
		.transform((val) => val === 'true')
		.optional(),
})

export function AIInstructionsModal({
	open,
	onClose,
	onSuccess,
	prdId,
	autoAccept,
	contextPromise,
}: {
	open: boolean
	autoAccept: boolean
	onClose: () => void
	onSuccess: () => void
	prdId: string
	contextPromise: Promise<{
		context: ExistingClient
		files: ContextFileClient[]
	}>
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-black/50 fixed inset-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 max-w-lg w-full -translate-x-1/2 -translate-y-1/2 focus:outline-none z-50">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-lg font-semibold">
								AI Instructions
							</CardTitle>
							<Button variant="ghost" onClick={onClose}>
								Close
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							<Suspense fallback={<div>Loading AI Instructions...</div>}>
								<Await resolve={contextPromise}>
									{({ context, files }) => (
										<InnerModalContent
											context={context}
											files={files}
											prdId={prdId}
											autoAccept={autoAccept}
											onClose={onClose}
											onSuccess={onSuccess}
										/>
									)}
								</Await>
							</Suspense>
						</CardContent>
					</Card>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

type InnerProps = {
	context: ExistingClient
	files: ContextFileClient[]
	prdId: string
	autoAccept: boolean
	onClose: () => void
	onSuccess: () => void
}

function InnerModalContent({
	context,
	files,
	prdId,
	autoAccept,
	onClose,
	onSuccess,
}: InnerProps) {
	const fetcher = useFetcher()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [content, setContent] = useState(context.textDump ?? '')
	const [isAutoAccept, setIsAutoAccept] = React.useState(autoAccept ?? false)
	const [form, fields] = useForm({
		id: 'ai-instructions',
		constraint: getZodConstraint(schema),
		lastResult: fetcher.data,
		defaultValue: {
			prdId,
			systemPrompt: context?.systemPrompt ?? '',
			textDump: context?.textDump ?? '',
			objType: 'uploadContext',
			website: '',
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		shouldValidate: 'onSubmit',
	})

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		formData.set('textDump', content)
		formData.set('intent', 'context')
		formData.set('autoAccept', isAutoAccept ? 'true' : 'false')

		const validationResult = parseWithZod(formData, { schema })
		if (validationResult.status === 'success') {
			fetcher.submit(e.currentTarget, {
				method: 'post',
				action: '/resources/prd-context',
				encType: 'multipart/form-data',
			})
			onSuccess()
			onClose()
		}
	}

	const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const file = e.dataTransfer.files[0]
		if (file && fileInputRef.current) {
			const dt = new DataTransfer()
			dt.items.add(file)
			fileInputRef.current.files = dt.files
			setSelectedFile(file)
		}
	}

	const handleToggleChange = (val: boolean) => setIsAutoAccept(val)
	return (
		<fetcher.Form
			{...getFormProps(form)}
			method="post"
			onSubmit={handleSubmit}
			className="space-y-4"
			encType="multipart/form-data"
		>
			<input type="hidden" name="prdId" value={prdId} />
			<input type="hidden" name="objType" value="uploadContext" />
			<input type="hidden" name="website" value="" />
			<input type="hidden" name="textDump" value={content} />
			<input
				type="hidden"
				name="autoAccept"
				value={isAutoAccept ? 'true' : 'false'}
			/>

			<TextareaField
				errors={fields.systemPrompt.errors}
				labelProps={{
					children: 'System Prompt',
					htmlFor: fields.systemPrompt.id,
				}}
				textareaProps={{
					...getInputProps(fields.systemPrompt, { type: 'text' }),
					placeholder: 'Instructions to give the AI on how to help you',
					autoFocus: true,
					rows: 4,
				}}
			/>

			<RichTextField
				className="my-4"
				errors={fields.textDump.errors}
				editorProps={{
					value: content,
					onChange: (val) => setContent(val),
				}}
				labelProps={{
					children: 'Paste Any Text Here (background, interview notes, etc.) ',
				}}
			/>

			<div className="my-2">Upload PDFs</div>
			<div
				onDragOver={(e) => {
					e.preventDefault()
					setIsDragging(true)
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleFileDrop}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						fileInputRef.current?.click()
					}
				}}
				onClick={() => fileInputRef.current?.click()}
				className={`border-2 border-dashed rounded-md p-4 cursor-pointer text-center ${
					isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
				}`}
			>
				<p className="text-sm text-gray-500">
					Drag & drop PDF here or click to upload
				</p>
				<Input
					ref={fileInputRef}
					type="file"
					name="file"
					accept="application/pdf"
					className="hidden"
					onChange={(e) => {
						const file = e.currentTarget.files?.[0] || null
						setSelectedFile(file)
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
					checked={isAutoAccept}
					onCheckedChange={handleToggleChange}
				/>
			</div>
			<div className="flex justify-end gap-2 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit">Save Instructions</Button>
			</div>
		</fetcher.Form>
	)
}
