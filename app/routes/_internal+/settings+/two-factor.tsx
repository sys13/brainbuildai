import { Outlet } from 'react-router'
import type { VerificationTypes } from '#app/routes/_auth+/verify'

export const twoFAVerificationType = '2fa' satisfies VerificationTypes

export default function TwoFactorRoute() {
	return <Outlet />
}
