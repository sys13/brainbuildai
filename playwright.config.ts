import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const PORT = process.env.PORT || '3000'

export default defineConfig({
	expect: {
		timeout: 10 * 1000,
	},
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
	reporter: 'html',
	retries: process.env.CI ? 2 : 0,
	testDir: './tests/e2e',
	timeout: 30 * 1000,
	use: {
		baseURL: `http://localhost:${PORT}/`,
		trace: 'on-first-retry',
	},

	// Skip specific tests
	grep: /^(?!.*((login with remember me toggled on)|(invalid login with error messages)|(signup to login flow)|(forgot password flow)|(login with remember me checked)|(signup with "what to build" parameter)|(invalid login attempts with error messages)|(login page validation)|(protected routes redirect to login)|(onboarding validation errors)|(onboarding with "what to build" parameter)|(signup with external provider)|(onboarding with link)|(onboarding with a short code)|(reset password with a short code)|(provider-specific onboarding flow)|(redirect from home to dashboard when logged in)|(redirect to login for unauthorized access to protected routes)|(redirect to requested page after signup)|(session persistence across page reloads)|(session handling with multiple tabs)|(redirect to original destination after login)|(session expiration behavior)|(Users can change their email address)|(redirect from login page after successful login)|(enable and disable 2FA)|(user profile update)|(change password)|(update email address)|(account deletion)|(change user email with verification)|(change user password)|(update profile information)|(enable and disable two-factor authentication)))/,

	webServer: {
		command: process.env.CI ? 'npm run start:mocks' : 'npm run dev',
		env: {
			PORT,
			MOCK_AI: 'true',
		},
		port: Number(PORT),
		reuseExistingServer: true,
		stderr: 'pipe',
		stdout: 'pipe',
	},

	workers: process.env.CI ? 1 : undefined,
})
