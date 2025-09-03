import { parseWithZod } from '@conform-to/zod'
import { useDebounceSubmit } from 'remix-utils/use-debounce-submit'
import { z } from 'zod'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon'
import { Input } from '#app/components/ui/input.js'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover'
import type { ExtendedCommentProps } from '#app/utils/suggestions.server/get-comments'

import { useRef, useState } from 'react'

import type { Route } from '../../routes/resources+/+types/prd-personas'
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
	isEditor: boolean
}

interface CommentsWithThreadProps extends ExtendedCommentProps {
	commentsInThread: ExtendedCommentProps[]
}

const schema = z.object({
	prdId: z.string(),
})

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	return result.reply()
}

export function PrdComment({
	prdId,
	name,
	comments,
}: {
	prdId: string
	name: string
	comments: ExtendedCommentProps[]
}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [threadId, setThreadId] = useState<string>('')
	const [inputValue, setInputValue] = useState('')
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}
	const submit = useDebounceSubmit()
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		submit(e.currentTarget as HTMLFormElement, {
			action: '/resources/add-comment',
			method: 'post',
			navigate: false,
		})
		setInputValue('')
	}
	const commentsToRender: CommentsWithThreadProps[] = []

	comments.map((item) => {
		if (!item.inThread) commentsToRender.push({ ...item, commentsInThread: [] })
	})
	comments.map((item) => {
		commentsToRender.map((i, index) => {
			if (item.inThread && item.objectId === i.id) {
				commentsToRender[index].commentsInThread.push(item)
			}
		})
	})

	const toComment = comments.find((item) => item.id === threadId)

	return (
		<Popover>
			<PopoverTrigger>
				<div className="relative cursor-pointer text-[12px] p-[3px_10px] hover:text-secondary-foreground/70 border border-[#64748B] rounded-full">
					<Icon name="message-square-text" size="sm" className="mr-1" />
					{comments.length > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
							{comments.length}
						</span>
					)}
					Add Comment
				</div>
			</PopoverTrigger>
			<PopoverContent align="end">
				<div className="overflow-y-auto max-h-80 h-full">
					{commentsToRender.map((comment: CommentsWithThreadProps) => (
						<div
							key={comment?.id}
							className="mb-2 relative group border rounded-md p-2"
						>
							<b>{comment.userName}:</b> {comment.text}
							<Button
								onClick={() => {
									setThreadId(comment.id)
									inputRef.current?.focus()
								}}
								variant="outline"
								className="text-xs px-1 h-6 absolute right-0 bottom-0 hidden group-hover:flex"
							>
								Reply in thread
							</Button>
							{comment.commentsInThread.map((i: ExtendedCommentProps) => (
								<div className="pl-3" key={i.id}>
									<b>{i.userName}:</b> {i.text}
								</div>
							))}
						</div>
					))}
				</div>
				{toComment && (
					<div className="flex items-center p-1">
						<span className="text-xs text-gray-500 mb-1">
							<b>{toComment.userName}</b>: {toComment.text}
						</span>
						<Icon
							name="cross-1"
							className="cursor-pointer hover:opacity-70"
							onClick={() => setThreadId('')}
						/>
					</div>
				)}
				<form onSubmit={handleSubmit}>
					<input name="objectType" type="hidden" value={name} />
					<input name="prdId" type="hidden" value={prdId} />
					<input
						name="inThread"
						type="hidden"
						value={threadId.length ? 'true' : 'false'}
					/>
					<input name="objectId" type="hidden" value={threadId || prdId} />
					<div className="flex space-x-2">
						<Input
							autoComplete="off"
							className="ml-0.5 focus-visible:ring-1 focus-within:ring-0 ring-offset-0 h-11"
							data-1p-ignore
							name="text"
							placeholder="Comment..."
							type="text"
							onChange={handleInputChange}
							value={inputValue}
							ref={inputRef}
						/>
						<Button
							className="ml-2 h-11 px-5"
							onClick={(e) => {
								handleSubmit(e)
							}}
							variant="outline"
						>
							Add
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	)
}
