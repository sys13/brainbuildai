import { useEffect, useRef, useState } from 'react'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { Button } from '#app/components/ui/button.js'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog'
import { Icon } from '#app/components/ui/icon'
import { Input } from '#app/components/ui/input.js'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select'

export enum SharePermission {
	reader = 'reader',
	commenter = 'commenter',
	editor = 'editor',
}
interface ShareEmailProps {
	id: string
	email: string
	sharePermission: 'reader' | 'commenter' | 'editor'
}
export interface ShareOptionsProps {
	id: string
	shareBy: string
	shareDomain: string
	sharePermission: 'reader' | 'commenter' | 'editor'
	emails: ShareEmailProps[]
	tenantId?: string
	isEditor: boolean
	isCommenter: boolean
	isReader: boolean
}

export function ShareSection({
	prdId,
	name,
	shareOptions,
}: {
	prdId: string
	name: string
	shareOptions: ShareOptionsProps
}) {
	const linkRef = useRef<HTMLInputElement>(null)
	const [link, setLink] = useState<string>('')
	useEffect(() => {
		if (window) {
			setLink(window.location.href)
		}
	}, [])

	const submit = useDebounceSubmit()
	const [shareDomain, setShareDomain] = useState<string>(
		shareOptions.shareDomain || '@',
	)
	const handleDomainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShareDomain(e.target.value)
	}

	const handleShareByChange = (e: string) => {
		const formData = new FormData()
		formData.append('action', shareOptions.id ? 'update' : 'create')
		formData.append('prdId', prdId)
		formData.append('shareBy', e)
		submit(formData, {
			action: '/resources/change-share-options',
			method: 'post',
			navigate: false,
		})
	}
	const handleSharePermissionChange = (e: string) => {
		const formData = new FormData()
		formData.append('action', 'update')
		formData.append('prdId', prdId)
		formData.append('shareBy', shareOptions.shareBy)
		formData.append('sharePermission', e)
		submit(formData, {
			action: '/resources/change-share-options',
			method: 'post',
			navigate: false,
		})
	}
	const handleDomainSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/change-share-options',
			method: 'post',
			navigate: false,
		})
	}
	const handleEmailSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/change-share-emails',
			method: 'post',
			navigate: false,
		})
	}
	const handleEmailPermissionChange = (e: string, id: string) => {
		const formData = new FormData()
		formData.append('action', 'update')
		formData.append('prdId', prdId)
		formData.append('sharePermission', e)
		formData.append('emailId', id)
		submit(formData, {
			action: '/resources/change-share-emails',
			method: 'post',
			navigate: false,
		})
	}
	const handleEmailPermissionDelete = (id: string) => {
		const formData = new FormData()
		formData.append('action', 'delete')
		formData.append('prdId', prdId)
		formData.append('emailId', id)
		submit(formData, {
			action: '/resources/change-share-emails',
			method: 'post',
			navigate: false,
		})
	}
	const copyToClipboard = () => {
		const copyText = linkRef.current

		copyText?.select()
		copyText?.setSelectionRange(0, 99999)

		navigator.clipboard.writeText(copyText?.value || '')
	}
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<Icon name="share" />
					<span className="hidden md:inline ml-1">Share</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="mb-4">Share PRD: {name}</DialogTitle>
					<DialogDescription>
						Share your PRD using link, domain (company) or list of e-mails
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="space-x-0 space-y-5 w-full block">
					<div className="space-y-5">
						<Select
							onValueChange={handleShareByChange}
							defaultValue="none"
							value={shareOptions.shareBy}
						>
							<SelectTrigger>
								<SelectValue placeholder={'Share by...'} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Don't share</SelectItem>
								<SelectItem value="link">Share by link</SelectItem>
								<SelectItem value="domain">Share by domain</SelectItem>
								<SelectItem value="email">Share by email</SelectItem>
							</SelectContent>
						</Select>
						{shareOptions.shareBy === 'link' && (
							<div className="flex items-center justify-between gap-2">
								<Input
									autoComplete="off"
									className="ml-0.5 focus-visible:ring-1 focus-within:ring-0 ring-offset-0 h-11"
									data-1p-ignore
									placeholder="Link"
									type="text"
									value={link}
									ref={linkRef}
								/>
								<Button variant="secondary" onClick={copyToClipboard}>
									<Icon name="link-2" />
								</Button>
							</div>
						)}
						{shareOptions.shareBy === 'domain' && (
							<form onSubmit={handleDomainSubmit}>
								<input name="prdId" type="hidden" value={prdId} />
								<input name="action" type="hidden" value="update" />
								<input
									name="shareBy"
									type="hidden"
									value={shareOptions.shareBy}
								/>
								{/* <input
									name="sharePermission"
									type="hidden"
									value={shareOptions.sharePermission}
								/> */}
								<div className="flex space-x-2">
									<Input
										autoComplete="off"
										className="ml-0.5 focus-visible:ring-1 focus-within:ring-0 ring-offset-0 h-11"
										data-1p-ignore
										name="shareDomain"
										onChange={handleDomainInputChange}
										placeholder="Domain name..."
										type="text"
										value={shareDomain}
									/>
									<Button
										className="ml-2 h-11 px-5"
										onClick={(e) => {
											handleDomainSubmit(e)
										}}
										variant="outline"
									>
										Save
									</Button>
								</div>
							</form>
						)}
						{shareOptions.shareBy === 'email' && (
							<>
								<div className="max-h-40 overflow-auto space-y-2">
									{shareOptions.emails.map((item: ShareEmailProps) => (
										<div className="flex items-center gap-2" key={item.id}>
											<div className="w-1/2">{item.email}</div>
											<div className="w-1/2 flex gap-2">
												<Select
													onValueChange={(e) =>
														handleEmailPermissionChange(e, item.id)
													}
													defaultValue="reader"
													value={item.sharePermission || 'reader'}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder={'Share permission...'} />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="reader">Reader</SelectItem>
														<SelectItem value="commenter">Commenter</SelectItem>
														<SelectItem value="editor">Editor</SelectItem>
													</SelectContent>
												</Select>
												<Button
													variant="secondary"
													onClick={() => handleEmailPermissionDelete(item.id)}
												>
													<Icon name="trash" />
												</Button>
											</div>
										</div>
									))}
								</div>
								<form className="mb-2" onSubmit={handleEmailSubmit}>
									<input name="objType" type="hidden" value="shareEmail" />
									<input name="prdId" type="hidden" value={prdId} />
									<input name="action" type="hidden" value="create" />
									<input name="sharePermission" type="hidden" value="reader" />
									<div className="flex space-x-2">
										<Input
											autoComplete="off"
											className="ml-0.5 focus-visible:ring-1 focus-within:ring-0 ring-offset-0 h-11"
											data-1p-ignore
											name="email"
											// onChange={handleInputChange}
											placeholder="Add new..."
											type="text"
											// value={inputValue}
										/>
										<Button
											className="ml-2 h-11 px-5"
											onClick={(e) => {
												handleEmailSubmit(e)
											}}
											variant="outline"
										>
											Add
										</Button>
									</div>
								</form>
							</>
						)}
						{(shareOptions.shareBy === 'link' ||
							shareOptions.shareBy === 'domain') && (
							<Select
								onValueChange={handleSharePermissionChange}
								defaultValue="reader"
								value={shareOptions.sharePermission || 'reader'}
							>
								<SelectTrigger>
									<SelectValue placeholder={'Share permission...'} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="reader">Reader</SelectItem>
									<SelectItem value="commenter">Commenter</SelectItem>
									<SelectItem value="editor">Editor</SelectItem>
								</SelectContent>
							</Select>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
