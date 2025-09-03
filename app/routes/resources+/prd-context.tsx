import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import pdf from 'pdf-parse/lib/pdf-parse'
import { useRef, useState } from 'react'
import { Form, data, useActionData, useFetcher } from 'react-router'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { RichTextField } from '#app/components/forms'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { Input } from '#app/components/ui/input'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import type { ContextFileClient, ExistingClient } from '#app/utils/sort-objs'
import { uploadContextPdf } from '#app/utils/storage.server'
import { getContextSummary } from '#app/utils/suggestions.server/get-context-summary'
import { createToastHeaders } from '#app/utils/toast.server'
import { context } from '#db/schema/context'
import { contextFile } from '#db/schema/contextFile.js'
import { prd } from '#db/schema/prd.js'
import type { Route } from './+types/prd-context'
const baseSchema = z.object({
	prdId: z.string(),
	objType: z.enum(['uploadContext', 'deleteContextFile']),
})
const uploadSchema = baseSchema.extend({
	objType: z.literal('uploadContext'),
	textDump: z.string().default(''),
	website: z.string().url().default(''),
	systemPrompt: z.string().optional(),
	autoAccept: z
		.union([z.literal('true'), z.literal('false')])
		.transform((val) => val === 'true')
		.optional(),

	file: z
		.instanceof(File)
		.refine((file) => file.size > 0 && file.type === 'application/pdf', {
			message: 'Only PDF files are allowed',
		})
		.optional(),
})

const deleteFileSchema = baseSchema.extend({
	objType: z.literal('deleteContextFile'),
	fileId: z.string(),
})

const schema = z.discriminatedUnion('objType', [uploadSchema, deleteFileSchema])
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

	switch (response.objType) {
		case 'uploadContext': {
			const { prdId, textDump, website, systemPrompt, file, autoAccept } =
				response
			if (file) {
				if (!(file instanceof File)) {
					throw new Error('Invalid file upload')
				}

				try {
					const key = await uploadContextPdf(id, file)
					const fileUrl = `${process.env.STORAGE_PUBLIC_URL}/${key}`

					const buffer = Buffer.from(await file.arrayBuffer())
					const pdfData = await pdf(buffer)
					let finalText = pdfData.text.trim()
					const wordCount = finalText.split(/\s+/).length
					if (wordCount > 250) {
						const contextSummary = await getContextSummary({
							textDump: finalText,
						})
						if (contextSummary) {
							finalText = contextSummary
						}
					}
					await db.insert(contextFile).values({
						tenantId,
						prdId,
						fileUrl,
						name: key,
						description: file.name,
						textDump: finalText,
					})
				} catch (error) {
					console.error('Error uploading or parsing PDF:', error)
					return data(
						{ errors: ['Failed to upload or parse PDF file'] },
						{ status: 400 },
					)
				}
			}

			if (textDump?.trim()) {
				console.log('autoAccept', autoAccept)
				await db
					.insert(context)
					.values({
						prdId,
						tenantId,
						textDump,
						systemPrompt,
						website,
					})
					.onConflictDoUpdate({
						set: {
							textDump,
							website,
							systemPrompt,
						},
						target: [context.prdId],
					})
				if (typeof autoAccept === 'boolean') {
					await db.update(prd).set({ autoAccept }).where(eq(prd.id, prdId))
				}
			}
			const headers = await createToastHeaders({
				description: 'Context updated',
				type: 'success',
			})

			return data(
				{ status: 'success', value: { textDump: textDump?.trim() ?? '' } },
				{ headers },
			)
		}

		case 'deleteContextFile': {
			const { prdId, fileId } = response

			try {
				await db
					.delete(contextFile)
					.where(
						and(
							eq(contextFile.id, fileId),
							eq(contextFile.prdId, prdId),
							eq(contextFile.tenantId, tenantId),
						),
					)

				const headers = await createToastHeaders({
					description: 'Context file deleted',
					type: 'success',
				})

				return data({ success: true }, { headers })
			} catch (error) {
				console.error('Error deleting context:', error)
				return data({ errors: ['Failed to delete context'] }, { status: 400 })
			}
		}

		default:
			return data({ errors: ['Invalid object type'] }, { status: 400 })
	}
}

export function ContextSection({
	prdId,
	context,
	files,
	isEditor,
}: {
	prdId: string
	context: ExistingClient
	files: ContextFileClient[]
	isEditor: boolean
}) {
	const lastResult = useActionData<ActionResponse>()
	const [isDragging, setIsDragging] = useState(false)
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>('')
	const submit = useDebounceSubmit()
	const imageFetcher = useFetcher()
	const deleteFetcher = useFetcher()
	const [content, setContent] = useState(context.textDump ?? '')
	const formRef = useRef<HTMLFormElement>(null)
	const imageFormRef = useRef<HTMLFormElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [form, fields] = useForm({
		constraint: getZodConstraint(schema),
		id: 'context-section',
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		defaultValue: { textDump: context.textDump },
		shouldRevalidate: 'onBlur',
	})

	const handleFileSelect = () => {
		const file = fileInputRef.current?.files?.[0]
		if (file && file.type === 'application/pdf' && imageFormRef.current) {
			const formData = new FormData(imageFormRef.current)
			formData.set('objType', 'uploadContext')
			formData.set('website', '')
			formData.set('prdId', prdId)
			formData.set('file', file)
			imageFetcher.submit(formData, {
				action: '/resources/prd-context',
				method: 'post',
				encType: 'multipart/form-data',
			})
		}
	}
	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const file = e.dataTransfer.files[0]
		if (file && fileInputRef.current) {
			const dt = new DataTransfer()
			dt.items.add(file)
			fileInputRef.current.files = dt.files
			handleFileSelect()
		}
	}
	function handleConfirmDelete(itemId: string) {
		deleteFetcher.submit(
			{
				objType: 'deleteContextFile',
				fileId: itemId,
				prdId,
			},
			{
				action: '/resources/prd-context',
				method: 'post',
			},
		)
		setDeleteConfirmId(null)
	}
	return (
		<div>
			<Form
				ref={formRef}
				method="POST"
				{...getFormProps(form)}
				action="/resources/prd-context"
				onBlur={(event) => {
					if (event.target.name === 'textDump') {
						submit(event.currentTarget, { debounceTimeout: 0, navigate: false })
					}
				}}
			>
				<input name="prdId" type="hidden" value={prdId} />
				<input type="hidden" name="objType" value="uploadContext" />
				<input type="hidden" name="website" value="" />
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
			{/* FILE UPLOAD FORM */}
			<div className="my-2">Upload PDFs</div>
			<imageFetcher.Form
				method="post"
				action="/resources/prd-context"
				encType="multipart/form-data"
				className="mb-4"
				ref={imageFormRef}
			>
				<input name="objType" type="hidden" value="uploadContext" />
				<input name="prdId" type="hidden" value={prdId} />
				<div
					onDragOver={(e) => {
						e.preventDefault()
						setIsDragging(true)
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							fileInputRef.current?.click()
						}
					}}
					className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
						isDragging ? 'bg-blue-50 border-blue-400' : 'bg-white'
					}`}
				>
					<p className="text-gray-500 mb-1 text-[12px]">
						Drag & Drop a PDF here, or click to select
					</p>
					<Input
						ref={fileInputRef}
						name="file"
						type="file"
						accept="application/pdf"
						className="hidden"
						onChange={handleFileSelect}
					/>
				</div>
			</imageFetcher.Form>
			{files.length > 0 && (
				<div className="mt-6">
					<h3 className="text-sm font-semibold text-gray-700 mb-2">
						Uploaded PDFs
					</h3>
					<div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{files.map((file) => (
							<div
								key={file.id}
								className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition relative pt-10"
							>
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm font-medium text-gray-800 truncate">
										{file.fileUrl.split('/').pop()}
									</div>
								</div>
								<div className="text-xs text-gray-500">
									Uploaded {new Date(file.createdAt).toLocaleDateString()}
								</div>
								<div className="flex items-center justify-between mb-2">
									<a
										href={file.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 text-sm hover:underline"
									>
										View
									</a>
								</div>
								{isEditor && (
									<Button
										onClick={() => setDeleteConfirmId(file.id)}
										type="button"
										variant="default"
										size="icon"
										className="w-8 h-8 absolute top-[5px] right-[5px]"
									>
										<Icon name="trash" />
									</Button>
								)}
							</div>
						))}
					</div>
				</div>
			)}
			{deleteConfirmId && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<h3>Are you sure you want to delete this PDF file?</h3>
						<div className="flex space-x-4 mt-4">
							<Button
								onClick={() => handleConfirmDelete(deleteConfirmId)}
								variant="destructive"
							>
								Confirm Delete
							</Button>
							<Button
								onClick={() => setDeleteConfirmId(null)}
								variant="secondary"
							>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
