import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { useFetcher } from 'react-router'
import { StatusButton } from '#app/components/ui/status-button'
import { verificationFilter } from '#app/models/verification.server'
import { requireRecentVerification } from '#app/routes/_auth+/verify.server'
import { requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { useDoubleCheck } from '#app/utils/misc'
import { redirectWithToast } from '#app/utils/toast.server'
import { verification } from '#db/schema/authentication'
import { twoFAVerificationType } from './two-factor'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireRecentVerification(request)
	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	await requireRecentVerification(request)
	const { id: userId } = await requireUser(request)
	await db
		.delete(verification)
		.where(verificationFilter({ target: userId, type: twoFAVerificationType }))
	return redirectWithToast('/settings/two-factor', {
		description: 'Two factor authentication has been disabled.',
		title: '2FA Disabled',
	})
}

export default function TwoFactorDisableRoute() {
	const disable2FAFetcher = useFetcher<typeof action>()
	const dc = useDoubleCheck()

	return (
		<div className="mx-auto max-w-sm">
			<disable2FAFetcher.Form method="POST">
				<p>
					Disabling two factor authentication is not recommended. However, if
					you would like to do so, click here:
				</p>
				<StatusButton
					status={disable2FAFetcher.state === 'loading' ? 'pending' : 'idle'}
					variant="destructive"
					{...dc.getButtonProps({
						className: 'mx-auto',
						name: 'intent',
						type: 'submit',
						value: 'disable',
					})}
				>
					{dc.doubleCheck ? 'Are you sure?' : 'Disable 2FA'}
				</StatusButton>
			</disable2FAFetcher.Form>
		</div>
	)
}
