import {
	type FieldMetadata,
	getInputProps,
	getTextareaProps,
} from '@conform-to/react'
import type React from 'react'
import { toTitleCase } from '#app/utils/stringUtils'
import { Field, TextareaField } from './forms'

type InputType = 'input' | 'textarea'

interface Props {
	autoFocus?: boolean
	field: FieldMetadata<string>
	inputType: InputType
	placeholder?: string
	title?: string
	type?: React.InputHTMLAttributes<HTMLInputElement>['type']
}

export function FormField({
	autoFocus,
	field,
	inputType,
	placeholder,
	title,
	type,
}: Props): React.ReactNode {
	const resolvedTitle = title ?? toTitleCase(field.name)
	switch (inputType) {
		case 'input':
			return (
				<Field
					errors={field.errors}
					inputProps={{
						...(autoFocus ? { autoFocus: true } : null),
						...getInputProps(field, { ariaAttributes: true, type: 'text' }),
						...(type ? { type } : null),
						placeholder,
					}}
					key={field.name}
					labelProps={{ children: resolvedTitle }}
				/>
			)
		case 'textarea':
			return (
				<TextareaField
					errors={field.errors}
					key={field.name}
					labelProps={{ children: resolvedTitle }}
					textareaProps={{
						...getTextareaProps(field, {
							ariaAttributes: true,
						}),
						placeholder,
					}}
				/>
			)
	}
}
