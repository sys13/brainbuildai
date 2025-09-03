import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { type ElementRef, useRef } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'

export function InputOTPConform({
	length = 6,
	meta,
	pattern = REGEXP_ONLY_DIGITS,
}: {
	length: number
	meta: FieldMetadata<string>
	pattern?: string
}) {
	const inputOTPRef = useRef<ElementRef<typeof InputOTP>>(null)
	const control = useControl(meta)

	return (
		<>
			<input
				className="sr-only"
				defaultValue={meta.initialValue}
				name={meta.name}
				onFocus={() => {
					inputOTPRef.current?.focus()
				}}
				ref={control.register}
				tabIndex={-1}
			/>
			<InputOTP
				maxLength={6}
				onBlur={control.blur}
				onChange={control.change}
				pattern={pattern}
				ref={inputOTPRef}
				value={control.value ?? ''}
			>
				<InputOTPGroup>
					{new Array(length).fill(0).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<InputOTPSlot index={index} key={index} />
					))}
				</InputOTPGroup>
			</InputOTP>
		</>
	)
}
