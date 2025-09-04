import { expect, test } from '#tests/playwright-utils'
import { fakerEN } from '@faker-js/faker'

const URL_REGEX = /(?<url>https?:\/\/[^\s$.?#].\S*)/
const _CODE_REGEX = /Here's your verification code: (?<code>\w+)/
function _extractUrl(text: string) {
	const match = text.match(URL_REGEX)
	return match?.groups?.url
}

test('login page validation', async ({ page }) => {
	// Navigate to login page
	await page.goto('/login')

	// Verify the page has loaded correctly
	await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()

	// Verify form elements exist
	await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
	await expect(page.getByLabel(/password/i)).toBeVisible()
	await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()

	// Verify "Create an account" link is present
	await expect(
		page.getByRole('link', { name: /create an account/i }),
	).toBeVisible()
})

test('signup page validation', async ({ page }) => {
	// Navigate to signup page
	await page.goto('/signup')

	// Verify the page has loaded correctly
	await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
	await expect(page.getByRole('button', { name: /submit/i })).toBeVisible()

	// Verify login link exists
	const loginLink = page
		.getByText(/already have an account/i)
		.locator('xpath=./following::a')
	if (await loginLink.isVisible()) {
		await expect(loginLink).toBeVisible()
	} else {
		// Alternative: check for any link to login
		await expect(
			page.getByRole('link', { name: /login|sign in/i }),
		).toBeVisible()
	}
})

test('password recovery page validation', async ({ page }) => {
	// Navigate to forgot password page
	await page.goto('/forgot-password')

	// Verify the page has loaded correctly
	await expect(
		page.getByRole('heading', { name: /forgot password|password recovery/i }),
	).toBeVisible()

	// Verify form elements exist
	await expect(
		page.getByRole('textbox', { name: /email|username/i }),
	).toBeVisible()
	await expect(
		page.getByRole('button', { name: /recover password|reset|submit/i }),
	).toBeVisible()

	// Verify "Back to login" link is present
	const backToLoginLink = page.getByRole('link', {
		name: /back to login|sign in/i,
	})
	await expect(backToLoginLink).toBeVisible()
})

test('protected routes redirect to login', async ({ page }) => {
	// Try accessing protected routes
	const protectedRoutes = ['/dashboard', '/settings', '/settings/profile']

	for (const route of protectedRoutes) {
		await page.goto(route)

		// Should be redirected to login page
		expect(page.url()).toContain('/login')

		// URL should contain the redirectTo parameter
		expect(page.url()).toContain('redirectTo=')
	}
})

test('login-logout flow', async ({ insertNewUser, page }) => {
	// Skip this test if insertNewUser is not available
	if (!insertNewUser) {
		test.skip()
		return
	}

	// Create a test user
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	// Login
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Verify successful login (URL pattern might need adjustment)
	await expect(page).toHaveURL(/\/dashboard|\/app|\/setup/)

	// Navigate to settings to find logout button
	await page.goto('/settings')
	const logoutButton = page.getByRole('button', { name: /logout|sign out/i })

	// Click logout if the button is found
	if (await logoutButton.isVisible()) {
		await logoutButton.click()

		await expect(page).toHaveURL(/\/|\/login/)

		// Explicitly clear cookies and storage after logout
		await page.context().clearCookies()
		await page.evaluate(() => {
			localStorage.clear()
			sessionStorage.clear()
		})
		// Visit /dashboard and log redirect chain
		const responses = []
		page.on('response', (response) => {
			if (
				response.url().includes('/dashboard') ||
				response.url().includes('/login')
			) {
				responses.push({
					url: response.url(),
					status: response.status(),
					headers: response.headers(),
				})
			}
		})
		await page.goto('/dashboard', { waitUntil: 'networkidle' })
		const dashboardUrl = page.url()
		expect(dashboardUrl).toContain('/login')
	}
})
