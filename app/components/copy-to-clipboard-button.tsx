import { useState } from 'react'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export const CopyToClipboardButton = ({
	className,
	copyText = 'Copy Text',
	text,
}: {
	className?: string
	copyText?: string
	text: string
}) => {
	const [isCopied, setIsCopied] = useState(false)

	const copyToClipboard = () => {
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setIsCopied(true)
				setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
			})
			.catch(() => {
				alert('Failed to copy text!')
			})
	}

	return (
		<Button className={className} onClick={copyToClipboard} variant="secondary">
			<Icon name={isCopied ? 'clipboard-check' : 'clipboard-paste'}>
				{isCopied ? 'Copied to Clipboard' : copyText}
			</Icon>
		</Button>
	)
}
