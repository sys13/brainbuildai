import type React from 'react'

interface Props {
	fieldDisplayName: string
	fieldValue: React.ReactNode
	// dataType:
}
export function DetailsField({ fieldDisplayName, fieldValue }: Props) {
	if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
		return null
	}

	return (
		<div>
			<span className="text-muted-foreground">{fieldDisplayName}: </span>
			<span>{fieldValue}</span>
		</div>
	)
}
