import { StatusButton } from './ui/status-button'

export function FormSubmitButton({
	formId,
	isPending,
}: {
	formId: string
	isPending: boolean
}): React.ReactNode {
	return (
		<div className="mt-4 flex justify-end gap-x-2">
			<StatusButton
				disabled={isPending}
				form={formId}
				status={isPending ? 'pending' : 'idle'}
				type="submit"
			>
				Submit
			</StatusButton>
		</div>
	)
}
