import { type FieldMetadata, getTextareaProps } from '@conform-to/react'
import type { ComponentProps } from 'react'
import { Textarea } from '#app/components/ui/textarea'

export const TextareaConform = ({
	meta,
	...props
}: ComponentProps<typeof Textarea> & {
	meta: FieldMetadata<string>
}) => {
	return <Textarea {...getTextareaProps(meta)} {...props} />
}
