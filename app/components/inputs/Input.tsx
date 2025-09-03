import { type FieldMetadata, getInputProps } from '@conform-to/react'
import type { ComponentProps } from 'react'
import { Input } from '../ui/input'

export const InputConform = ({
	meta,
	type,
	...props
}: ComponentProps<typeof Input> & {
	meta: FieldMetadata<string>
	type: Parameters<typeof getInputProps>[1]['type']
}) => {
	return (
		<Input
			{...getInputProps(meta, { ariaAttributes: true, type })}
			{...props}
		/>
	)
}
