import { Form } from 'react-router'
import { z } from 'zod'
import { Icon } from '#app/components/ui/icon'
import { StatusButton } from '#app/components/ui/status-button'
import { useIsPending } from './misc'

export const GITHUB_PROVIDER_NAME = 'github'
export const GOOGLE_PROVIDER_NAME = 'google'
// to add another provider, set their name here and add it to the providerNames below

export const providerNames = [
	GOOGLE_PROVIDER_NAME,
	GITHUB_PROVIDER_NAME,
] as const
export const ProviderNameSchema = z.enum(providerNames)
export type ProviderName = z.infer<typeof ProviderNameSchema>

export const providerLabels: Record<ProviderName, string> = {
	[GOOGLE_PROVIDER_NAME]: 'Google',
	[GITHUB_PROVIDER_NAME]: 'GitHub',
} as const

export const providerIcons: Record<ProviderName, React.ReactNode> = {
	[GOOGLE_PROVIDER_NAME]: <Icon name="google-logo" />,
	[GITHUB_PROVIDER_NAME]: <Icon name="github-logo" />,
} as const

export function ProviderConnectionForm({
	providerName,
	redirectTo,
	type,
}: {
	providerName: ProviderName
	redirectTo?: null | string
	type: 'Connect' | 'Login' | 'Signup'
}) {
	const label = providerLabels[providerName]
	const formAction = `/auth/${providerName}`
	const isPending = useIsPending({ formAction })
	return (
		<Form
			action={formAction}
			className="flex items-center justify-center gap-2"
			method="POST"
		>
			{redirectTo ? (
				<input name="redirectTo" type="hidden" value={redirectTo} />
			) : null}
			<StatusButton
				className="w-full"
				status={isPending ? 'pending' : 'idle'}
				type="submit"
			>
				<span className="inline-flex items-center gap-1.5">
					{providerIcons[providerName]}
					<span>
						{type} with {label}
					</span>
				</span>
			</StatusButton>
		</Form>
	)
}
