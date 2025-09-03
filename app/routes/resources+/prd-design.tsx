import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import { Img } from 'openimg/react'
import { useEffect, useRef, useState } from 'react'
import { data, useFetcher } from 'react-router'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { Input } from '#app/components/ui/input'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import type { DesignImageClient, DesignLinkClient } from '#app/utils/sort-objs'
import { uploadDesignImage } from '#app/utils/storage.server'
import { createToastHeaders } from '#app/utils/toast.server.js'
import { designImage } from '#db/schema/designImage'
import { designLink } from '../../../db/schema/designLink'
import type { Route } from './+types/prd-personas'
const baseSchema = z.object({
	prdId: z.string(),
	objType: z.enum([
		'designLink',
		'designImage',
		'editDesignLink',
		'deleteDesignLink',
		'deleteDesignImage',
	]),
})

const linkSchema = baseSchema.extend({
	objType: z.literal('designLink'),
	name: z.string().min(1, 'Name is required'),
	url: z.string().url('Invalid URL'),
})
const editLinkSchema = baseSchema.extend({
	objType: z.literal('editDesignLink'),
	id: z.string(), // assuming you'll pass the existing link's ID to edit
	name: z.string().min(1, 'Name is required'),
	url: z.string().url('Invalid URL'),
})
const deleteImageSchema = baseSchema.extend({
	objType: z.literal('deleteDesignImage'),
	id: z.string(),
})
const imageSchema = baseSchema.extend({
	objType: z.literal('designImage'),
	file: z.instanceof(File).refine((file) => file.size > 0, 'File is required'),
})
const deleteLinkSchema = baseSchema.extend({
	objType: z.literal('deleteDesignLink'),
	id: z.string(),
})

const schema = z.discriminatedUnion('objType', [
	linkSchema,
	imageSchema,
	editLinkSchema,
	deleteLinkSchema,
	deleteImageSchema,
])

export async function action({ request }: Route.ActionArgs) {
	const { tenantId, id } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })
	if (result.status !== 'success') {
		return data({ errors: result.error }, { status: 400 })
	}
	const response = result.value
	switch (response.objType) {
		case 'designLink': {
			const { prdId, name, url } = response
			try {
				await db.insert(designLink).values({
					tenantId,
					prdId,
					url,
					name,
				})
				// ✅ Show success toast
				const headers = await createToastHeaders({
					description: `Design Link added: ${name}`,
					type: 'success',
				})
				return data({ success: true }, { headers })
			} catch (error) {
				console.error('Error inserting designLink:', error)
				return data({ errors: ['Invalid file upload'] }, { status: 400 })
			}
		}

		case 'editDesignLink': {
			const { id, name, url, prdId } = response
			try {
				await db
					.update(designLink)
					.set({ name, url })
					.where(and(eq(designLink.id, id), eq(designLink.prdId, prdId)))
				// ✅ Show success toast
				const headers = await createToastHeaders({
					description: `Design Link updated: ${name}`,
					type: 'success',
				})

				return data({ success: true }, { headers })
			} catch (error) {
				console.error('Error updating designLink:', error)
				return data(
					{ errors: ['Failed to update design link'] },
					{ status: 400 },
				)
			}
		}

		case 'deleteDesignLink': {
			const { id, prdId } = response
			try {
				await db
					.delete(designLink)
					.where(and(eq(designLink.id, id), eq(designLink.prdId, prdId)))

				// ✅ Show success toast
				const headers = await createToastHeaders({
					description: 'Design Link deleted',
					type: 'success',
				})

				return data({ success: true }, { headers })
			} catch (error) {
				console.error('Error deleting design link:', error)
				return data(
					{ errors: ['Failed to delete design link'] },
					{ status: 400 },
				)
			}
		}

		case 'designImage': {
			const file = formData.get('file')
			const { prdId } = response
			if (!(file instanceof File)) {
				throw new Error('Invalid file upload')
			}

			try {
				const key = await uploadDesignImage(id, file)
				const imageUrl = `${process.env.STORAGE_PUBLIC_URL}/${key}`

				await db
					.insert(designImage)
					.values({ tenantId, prdId, imageUrl, name: key })

				// ✅ Show success toast
				const headers = await createToastHeaders({
					description: 'Design Image uploaded',
					type: 'success',
				})

				return data({ success: true }, { headers })
			} catch (error) {
				console.error('Error uploading design image:', error)
				return data(
					{ errors: ['Failed to upload design image'] },
					{ status: 400 },
				)
			}
		}

		case 'deleteDesignImage': {
			const { id: imageId, prdId } = response
			try {
				await db
					.delete(designImage)
					.where(
						and(
							eq(designImage.id, imageId),
							eq(designImage.tenantId, tenantId),
							eq(designImage.prdId, prdId),
						),
					)
				// ✅ Show success toast
				const headers = await createToastHeaders({
					description: 'Design Image deleted',
					type: 'success',
				})

				return data({ success: true }, { headers })
			} catch (error) {
				console.error('Error deleting design image:', error)
				return data(
					{ errors: ['Failed to delete design image'] },
					{ status: 400 },
				)
			}
		}

		default:
			return data({ errors: ['Invalid object type'] }, { status: 400 })
	}
}

export function DesignSection({
	prdId,
	designs,
	isEditor,
}: {
	prdId: string
	designs: {
		links: DesignLinkClient[]
		images: DesignImageClient[]
	}
	isEditor: boolean
}) {
	const [isDragging, setIsDragging] = useState(false)
	const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
	const [editName, setEditName] = useState('')
	const [editUrl, setEditUrl] = useState('')
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>('')
	const [deleteImageConfirmId, setDeleteImageConfirmId] = useState<
		string | null
	>(null)
	const [deleteLinkConfirmId, setDeleteLinkConfirmId] = useState<string | null>(
		null,
	)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const linkFetcher = useFetcher()
	const editFetcher = useFetcher()
	const imageFetcher = useFetcher()
	const deleteFetcher = useFetcher()
	const formRef = useRef<HTMLFormElement>(null)
	const isSuccess = editFetcher.data?.success
	const isImageUploadSuccess = imageFetcher.data?.success
	const isUploading = imageFetcher.state !== 'idle'
	// Auto-close edit mode after successful submit
	useEffect(() => {
		if (isSuccess) {
			setEditingLinkId(null)
		}
	}, [isSuccess])

	useEffect(() => {
		if (isImageUploadSuccess) {
			setIsDragging(false)
		}
	}, [isImageUploadSuccess])
	const [form, fields] = useForm({
		id: 'create-design-link',
		constraint: getZodConstraint(linkSchema), // 👈 use your Zod schema for client-side validation
		lastResult: linkFetcher.data, // sync server validation errors
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: linkSchema })
		},
		shouldValidate: 'onBlur',
	})

	const fetcher = useFetcher()

	const handleFileSelect = () => {
		if (formRef.current) {
			imageFetcher.submit(formRef.current, {
				action: '/resources/prd-design',
				method: 'post',
				encType: 'multipart/form-data',
			})
		}
	}

	// 📦 File Drop handler
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

	function startEditing(item: { id: string; name: string; url: string }) {
		setEditingLinkId(item.id)
		setEditName(item.name)
		setEditUrl(item.url)
	}
	// Function to handle delete confirmation
	function handleDeleteClick(itemId: string) {
		setDeleteConfirmId(itemId) // This triggers the confirmation modal
	}

	function handleConfirmDelete(itemId: string) {
		deleteFetcher.submit(
			{
				objType: 'deleteDesignImage',
				id: itemId,
				prdId,
			},
			{
				action: '/resources/prd-design',
				method: 'post',
			},
		)
		setDeleteConfirmId(null) // Reset confirmation state
	}
	function handleLinkConfirmDelete(itemId: string) {
		deleteFetcher.submit(
			{
				objType: 'deleteDesignLink',
				id: itemId,
				prdId,
			},
			{
				action: '/resources/prd-design',
				method: 'post',
			},
		)
		setDeleteLinkConfirmId(null) // Reset confirmation state
	}

	function handleCancelDelete() {
		setDeleteConfirmId(null) // Close the confirmation modal
	}

	const hasAnyDesigns = designs.links.length > 0 || designs.images.length > 0

	return (
		<div>
			{!hasAnyDesigns && !isEditor && (
				<p className="text-sm text-muted-foreground italic">
					No designs added yet.
				</p>
			)}
			{(isEditor || designs.links.length > 0) && (
				<>
					<div className="mb-2">Design Links</div>
					<ul className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mb-5">
						{isEditor && (
							<li className=" flex items-center justify-center">
								<linkFetcher.Form
									{...getFormProps(form)}
									method="post"
									action="/resources/prd-design"
									className="w-full"
								>
									<input name="objType" type="hidden" value="designLink" />
									<input name="prdId" type="hidden" value={prdId} />
									<div className="flex flex-col space-y-2">
										<Field
											errors={fields.url.errors}
											inputProps={{
												...getInputProps(fields.url, { type: 'text' }),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Link',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
										<Field
											errors={fields.name.errors}
											inputProps={{
												...getInputProps(fields.name, { type: 'text' }),
												autoFocus: false,
												className:
													'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
												placeholder: 'Name',
											}}
											labelProps={{ children: '' }}
											noErrorMin
										/>
										<Button className="h-10" type="submit" variant="outline">
											<Icon name="plus" size="md" />
											Add
										</Button>
									</div>
								</linkFetcher.Form>
							</li>
						)}
						{designs.links.map((item) => {
							const isEditing = editingLinkId === item.id
							return (
								<li
									key={item.id}
									className="border rounded-xl p-4 shadow-sm bg-white"
								>
									{isEditing ? (
										// Editable Fields
										<editFetcher.Form
											method="post"
											action="/resources/prd-design"
											className="w-full"
										>
											<input
												name="objType"
												type="hidden"
												value="editDesignLink"
											/>
											<input name="prdId" type="hidden" value={prdId} />
											<input name="id" type="hidden" value={item.id} />

											<div className="flex flex-col space-y-2">
												<Field
													inputProps={{
														name: 'url',
														type: 'text',
														defaultValue: item.url,
														className:
															'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
														placeholder: 'Link',
													}}
													labelProps={{ children: '' }}
													noErrorMin
												/>
												<Field
													inputProps={{
														name: 'name',
														type: 'text',
														defaultValue: item.name,
														className:
															'focus-visible:ring-1 focus-within:ring-0 ring-offset-0 ',
														placeholder: 'Name',
													}}
													labelProps={{ children: '' }}
													noErrorMin
												/>
												<div className="flex space-x-2">
													<Button size="sm" type="submit">
														Save
													</Button>
													<Button
														size="sm"
														variant="secondary"
														onClick={() => setEditingLinkId(null)}
													>
														Cancel
													</Button>
												</div>
											</div>
										</editFetcher.Form>
									) : (
										// View Mode
										<div>
											<div className="flex items-center space-x-2">
												<p className="font-medium">{item.name}</p>
												{isEditor && (
													<Button
														onClick={() => startEditing(item)}
														size="icon"
														variant="ghost"
													>
														<Icon className="" name="pencil" />
													</Button>
												)}
												{/* Delete Button */}
												{isEditor && (
													<fetcher.Form
														method="post"
														action="/resources/prd-design"
													>
														<input
															type="hidden"
															name="objType"
															value="deleteDesignLink"
														/>
														<input type="hidden" name="prdId" value={prdId} />
														<input type="hidden" name="id" value={item.id} />
														<Button
															type="button"
															size="icon"
															variant="ghost"
															onClick={() => setDeleteLinkConfirmId(item.id)}
														>
															<Icon name="trash" className="text-red-500" />
														</Button>
													</fetcher.Form>
												)}
											</div>
											<a
												href={item.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:underline"
											>
												Visit Link →
											</a>
										</div>
									)}
								</li>
							)
						})}
					</ul>
				</>
			)}

			{(isEditor || designs.images.length > 0) && (
				<>
					<div className="mb-2">Design Images</div>
					{/* Image Upload Form */}
					{isEditor && (
						<imageFetcher.Form
							method="post"
							encType="multipart/form-data"
							className="mb-4"
							ref={formRef}
						>
							<input name="objType" type="hidden" value="designImage" />
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
								className={`flex flex-col items-center justify-center bg-secondary/70 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
									isDragging ? 'bg-blue-50 border-blue-400' : 'bg-secondary/70'
								}`}
							>
								<Img
									alt="icon"
									src="/img/file-upload.svg"
									width={50}
									height={50}
								/>
								<p className="text-gray-500 mb-1 text-[12px]">
									Drag & drop image here, or{' '}
									<span className="text-[#006FEE]">click to select</span>
								</p>
								<Input
									ref={fileInputRef}
									name="file"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileSelect}
								/>
							</div>
						</imageFetcher.Form>
					)}
					<ul className="space-y-4">
						{designs.images.map((item) => (
							<li
								key={item.id}
								className="flex items-center w-full border border-[#DBDBDB] p-2 justify-between rounded-md"
							>
								<a
									href={item.imageUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="block"
								>
									<div className="w-full flex items-center ">
										<Img
											alt="icon"
											src="/img/jpg-icon.png"
											width={35}
											height={35}
										/>
										<div className="ml-4">
											<p className="text-[14px]">
												{item.imageUrl.split('/').pop()}
											</p>
											<p className="text-[12px] text-[#343A3E]">
												{item.createdAt.getTime()}
											</p>
										</div>
									</div>
								</a>
								{/* Delete Button with Confirmation */}
								{isEditor && (
									<Button
										onClick={() => handleDeleteClick(item.id)}
										type="button"
										variant="default"
										size="icon"
										className="w-8 h-8 "
									>
										<Icon name="trash" />
									</Button>
								)}

								{/* Delete Confirmation Modal */}
							</li>
						))}
						{designs.images.map((item) => (
							<li
								key={item.id}
								className="border rounded-lg overflow-hidden shadow-md relative"
							>
								<a
									href={item.imageUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="block"
								>
									<div className="w-full h-40 bg-gray-100">
										{/* <img
									src={item.imageUrl}
									alt="Design"
									className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
								/> */}
										<Img
											alt="Design"
											className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
											src={item.imageUrl}
											width={256}
											height={256}
										/>
									</div>
								</a>
								{/* Delete Button with Confirmation */}
								{isEditor && (
									<Button
										onClick={() => handleDeleteClick(item.id)}
										type="button"
										variant="default"
										size="icon"
										className="w-8 h-8 absolute top-[5px] right-[5px]"
									>
										<Icon name="trash" />
									</Button>
								)}

								{/* Delete Confirmation Modal */}
							</li>
						))}
					</ul>
				</>
			)}

			{deleteConfirmId && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<h3>Are you sure you want to delete this image?</h3>
						<div className="flex space-x-4 mt-4">
							<Button
								onClick={() => handleConfirmDelete(deleteConfirmId)}
								variant="destructive"
							>
								Confirm Delete
							</Button>
							<Button onClick={handleCancelDelete} variant="secondary">
								Cancel
							</Button>
						</div>
					</div>
				</div>
			)}
			{deleteLinkConfirmId && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<h3>Are you sure you want to delete this link?</h3>
						<div className="flex space-x-4 mt-4">
							<Button
								onClick={() => handleLinkConfirmDelete(deleteLinkConfirmId)}
								variant="destructive"
							>
								Confirm Delete
							</Button>
							<Button
								onClick={() => setDeleteLinkConfirmId(null)}
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
