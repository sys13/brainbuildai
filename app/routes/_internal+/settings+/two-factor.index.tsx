import type { SEOHandle } from '@nasa-gcn/remix-seo'
import {
	type ActionFunctionArgs,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useFetcher,
	useLoaderData,
} from 'react-router'
import { Icon } from '#app/components/ui/icon'
import { StatusButton } from '#app/components/ui/status-button'
import { verificationFilter } from '#app/models/verification.server'
import { requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { generateTOTP } from '#app/utils/totp.server'
import { verification } from '#db/schema/authentication'
import { twoFAVerificationType } from './two-factor'
import { twoFAVerifyVerificationType } from './two-factor.verify'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { id: userId } = await requireUser(request)
	const verification = await db.query.verification.findFirst({
		columns: { id: true },
		where: { target: userId, type: twoFAVerificationType },
	})
	return { is2FAEnabled: Boolean(verification) }
}

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId, tenantId } = await requireUser(request)
	const {
		// otp: _otp,
		...config
	} = await generateTOTP()
	const verificationData = {
		...config,
		target: userId,
		tenantId,
		type: twoFAVerifyVerificationType,
	}
	await db
		.insert(verification)
		.values(verificationData)
		.onConflictDoUpdate({
			set: verificationData,
			target: [verification.target, verification.type],
			where: verificationFilter({
				target: userId,
				type: twoFAVerifyVerificationType,
			}),
		})
	return redirect('/settings/two-factor/verify')
}

export default function TwoFactorRoute() {
	const data = useLoaderData<typeof loader>()
	const enable2FAFetcher = useFetcher<typeof action>()

	return (
		<div className="flex flex-col gap-4">
			{data.is2FAEnabled ? (
				<>
					<p className="text-lg">
						<Icon name="check">
							You have enabled two-factor authentication.
						</Icon>
					</p>
					<Link to="disable">
						<Icon name="lock-open-1">Disable 2FA</Icon>
					</Link>
				</>
			) : (
				<>
					<p>
						<Icon name="lock-open-1">
							You have not enabled two-factor authentication yet.
						</Icon>
					</p>
					<p className="text-sm">
						Two factor authentication adds an extra layer of security to your
						account. You will need to enter a code from an authenticator app
						like{' '}
						<a className="underline" href="https://1password.com/">
							1Password
						</a>{' '}
						to log in.
					</p>
					<enable2FAFetcher.Form method="POST">
						<StatusButton
							className="mx-auto"
							name="intent"
							status={enable2FAFetcher.state === 'loading' ? 'pending' : 'idle'}
							type="submit"
							value="enable"
						>
							Enable 2FA
						</StatusButton>
					</enable2FAFetcher.Form>
				</>
			)}
		</div>
	)
}
