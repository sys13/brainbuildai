import { type FieldMetadata, useInputControl } from '@conform-to/react'
import { Editor } from '@tinymce/tinymce-react'
import { type OTPInputProps, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import type React from 'react'
import { type JSX, useEffect, useId, useState } from 'react'
import { cn } from '#app/utils/misc'
import { DatePickerConform } from './inputs/DatePicker'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from './ui/input-otp'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

// Local alias so we can reference the checkbox props type below
type CheckboxProps = React.ComponentPropsWithoutRef<typeof Checkbox>
type ListOfErrors = (null | string | undefined)[] | null | undefined

export function ErrorList({
	errors,
	id,
}: {
	errors?: ListOfErrors
	id?: string
}) {
	const errorsToRender = errors?.filter(Boolean)

	if (!errorsToRender?.length) {
		return null
	}
	return (
		<ul className="flex flex-col gap-1" id={id}>
			{errorsToRender.map((e) => (
				<li className="text-[10px] text-foreground-destructive" key={e}>
					{e}
				</li>
			))}
		</ul>
	)
}

export function Field({
	className,
	errors,
	inputProps,
	labelProps,
	noErrorMin,
}: {
	className?: string
	errors?: ListOfErrors
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	noErrorMin?: true
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={cn('gap-2 grid', className)}>
			<Label htmlFor={id} {...labelProps} />
			<Input
				aria-describedby={errorId}
				aria-invalid={errorId ? true : undefined}
				id={id}
				{...inputProps}
			/>
			<div className={cn('px-4 pb-3', noErrorMin ?? 'min-h-[32px]')}>
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	)
}

export function OTPField({
	className,
	errors,
	inputProps,
	labelProps,
}: {
	className?: string
	errors?: ListOfErrors
	inputProps: Partial<OTPInputProps & { render: never }>
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<InputOTP
				aria-describedby={errorId}
				aria-invalid={errorId ? true : undefined}
				id={id}
				maxLength={6}
				pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
				{...inputProps}
			>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
				</InputOTPGroup>
				<InputOTPSeparator />
				<InputOTPGroup>
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	)
}

export function TextareaField({
	className,
	errors,
	labelProps,
	textareaProps,
}: {
	className?: string
	errors?: ListOfErrors
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}) {
	const fallbackId = useId()
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={cn('gap-2 grid', className)}>
			<Label htmlFor={id} {...labelProps} />
			<Textarea
				aria-describedby={errorId}
				aria-invalid={errorId ? true : undefined}
				id={id}
				{...textareaProps}
			/>
			{errorId && (
				<div className="min-h-[32px] px-4 pb-3 pt-1">
					<ErrorList errors={errors} id={errorId} />
				</div>
			)}
		</div>
	)
}
interface RichTextFieldProps {
	className?: string
	errors?: string[]
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	editorProps: {
		id?: string
		value: string
		disabled?: boolean
		onChange: (value: string) => void
		onBlur?: () => void
	}
}
export function RichTextField({
	className,
	errors,
	labelProps,
	editorProps,
}: RichTextFieldProps) {
	const fallbackId = useId()

	const id = editorProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	const [isDark, setIsDark] = useState(
		typeof document !== 'undefined' &&
			document.documentElement.classList.contains('dark'),
	)

	useEffect(() => {
		const observer = new MutationObserver(() => {
			const html = document.documentElement
			setIsDark(html.classList.contains('dark'))
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => observer.disconnect()
	}, [])

	return (
		<div className={cn('gap-2 grid', className)}>
			<Label htmlFor={id} {...labelProps} />
			<input type="hidden" value={editorProps.value} readOnly />
			<Editor
				apiKey="m6w8wawifh0zpmj82au3tpr1ty5r4klophd4bann1k820q6d"
				value={editorProps.value}
				onEditorChange={editorProps.onChange}
				disabled={editorProps.disabled}
				init={{
					height: 300,
					menubar: false,
					plugins: [
						'advlist autolink lists link image charmap preview anchor',
						'searchreplace visualblocks code fullscreen',
						'insertdatetime media table paste code help wordcount',
					],
					toolbar:
						'undo redo | formatselect | bold italic backcolor | ' +
						'alignleft aligncenter alignright alignjustify | ' +
						'bullist numlist outdent indent | removeformat | help',
					skin: isDark ? 'oxide-dark' : 'oxide',
					content_css: isDark ? 'dark' : 'default',
					content_style:
						'body { font-family: var(--font-sans); font-size: 14px; }',
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault()
						e.stopPropagation()
					}
				}}
				onBlur={editorProps?.onBlur}
			/>
			{errorId && (
				<div className="min-h-[32px] px-4 pb-3 pt-1">
					<ErrorList errors={errors} id={errorId} />
				</div>
			)}
		</div>
	)
}
export function CheckboxField({
	buttonProps,
	className,
	errors,
	labelProps,
}: {
	buttonProps: CheckboxProps & {
		form: string
		name: string
		value?: string
	}
	className?: string
	errors?: ListOfErrors
	labelProps: JSX.IntrinsicElements['label']
}) {
	const { defaultChecked, key, ...checkboxProps } = buttonProps
	const fallbackId = useId()
	const checkedValue = buttonProps.value ?? 'on'
	const input = useInputControl({
		formId: buttonProps.form,
		initialValue: defaultChecked ? checkedValue : undefined,
		key,
		name: buttonProps.name,
	})
	const id = buttonProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<div className="flex gap-2">
				<Checkbox
					{...checkboxProps}
					aria-describedby={errorId}
					aria-invalid={errorId ? true : undefined}
					checked={input.value === checkedValue}
					id={id}
					onBlur={(event) => {
						input.blur()
						buttonProps.onBlur?.(event)
					}}
					onCheckedChange={(state) => {
						input.change(state.valueOf() ? checkedValue : '')
						buttonProps.onCheckedChange?.(state)
					}}
					onFocus={(event) => {
						input.focus()
						buttonProps.onFocus?.(event)
					}}
					type="button"
				/>
				<Label
					htmlFor={id}
					{...labelProps}
					className="self-center text-body-xs text-muted-foreground"
				/>
			</div>
			<div className="px-4 pb-3 pt-1">
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	)
}

export function DateField({
	className,
	errors,
	inputProps,
	labelProps,
	meta,
}: {
	className?: string
	errors?: ListOfErrors
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	meta: FieldMetadata<Date>
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={cn('gap-2 grid', className)}>
			<Label htmlFor={id} {...labelProps} />
			<DatePickerConform meta={meta} />
			<div className="min-h-[32px] px-4 pb-3">
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	)
}
