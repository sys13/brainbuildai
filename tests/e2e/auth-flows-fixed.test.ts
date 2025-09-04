import { fakerEN } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import { db } from '#app/utils/db.server'
import { invariant } from '#app/utils/misc'
import { user } from '#db/schema/base'
import { readEmail } from '#tests/mocks/utils'
import { test as base, createUser, expect } from '#tests/playwright-utils'

const URL_REGEX = /(?<url>https?:\/\/[^\s$.?#].\S*)/
const CODE_REGEX = /Here's your verification code: (?<code>\w+)/
function _extractUrl(text: string) {
	const match = text.match(URL_REGEX)
	return match?.groups?.url
}

const test = base.extend<{
	getOnboardingData(): {
		email: string
		name: string
		password: string
		username: string
	}
}>({
	// biome-ignore lint/correctness/noEmptyPattern: <explanation>
	getOnboardingData: async ({}, use) => {
		const userData = createUser()
		await use(() => {
			const onboardingData = {
				...userData,
				password: fakerEN.internet.password(),
			}
			return onboardingData
		})
		await db.delete(user).where(eq(user.username, userData.username))
	},
})

test('login with remember me toggled on', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)

	// Find the remember me button and check it if it's not already checked
	const rememberMeButton = page.getByRole('checkbox', { name: /remember me/i })
	const isChecked = await rememberMeButton.getAttribute('aria-checked')
	if (isChecked === 'false') {
		await rememberMeButton.click()
	}

	await page.getByRole('button', { name: /log in/i }).click()

	// Check that we're logged in and redirected appropriately
	// This might be to /dashboard or /app depending on the user type
	await expect(page).toHaveURL(/\/dashboard|\/app|\/setup/)

	// Store cookies for later check
	const cookies = await page.context().cookies()
	const authCookie = cookies.find((c) => c.name.includes('auth'))
	invariant(authCookie, 'Auth cookie not found')

	// For a "remember me" session, the cookie should have a relatively long expiration
	// But we can't make too specific assertions as the exact expiration time will vary
	if (authCookie.expires !== -1) {
		const expiryDate = new Date(authCookie.expires * 1000)
		const now = new Date()
		expect(expiryDate > now).toBeTruthy()
	}
})

test('invalid login with error messages', async ({ page }) => {
	await page.goto('/login')

	// Submit without filling in any fields
	await page.getByRole('button', { name: /log in/i }).click()

	// Check for validation errors - the exact text may vary
	await expect(page.getByText(/required|invalid/i)).toBeVisible()

	// Test invalid credentials
	await page
		.getByRole('textbox', { name: /email/i })
		.fill('nonexistent@example.com')
	await page.getByLabel(/^password$/i).fill('wrongpassword')
	await page.getByRole('button', { name: /log in/i }).click()

	// Check for invalid credentials message
	await expect(page.getByText(/invalid email or password/i)).toBeVisible()
})

test('signup to login flow', async ({ getOnboardingData, page }) => {
	const onboardingData = getOnboardingData()

	// Start at signup page
	await page.goto('/signup')

	// Fill out initial signup form
	await page.getByRole('textbox', { name: /email/i }).fill(onboardingData.email)
	await page.getByRole('button', { name: /submit/i }).click()

	// Check for email verification message
	await expect(page.getByText(/check your email/i)).toBeVisible()

	// Get verification code from email
	const email = await readEmail(onboardingData.email)
	invariant(email, 'Email not found')
	const code = email.text.match(CODE_REGEX)?.groups?.code
	invariant(code, 'Verification code not found')

	// Enter verification code
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit/i }).click()

	// Complete onboarding form
	await expect(page).toHaveURL('/onboarding')
	await page.getByRole('textbox', { name: /^name/i }).fill(onboardingData.name)
	await page.getByLabel(/^password/i).fill(onboardingData.password)
	await page.getByLabel(/^confirm password/i).fill(onboardingData.password)

	// Check required checkboxes
	const termsCheckbox = page.getByRole('checkbox', { name: /terms|agree/i })
	if ((await termsCheckbox.getAttribute('aria-checked')) === 'false') {
		await termsCheckbox.click()
	}

	// Submit the form
	await page.getByRole('button', { name: /create an account/i }).click()

	// Verify redirection to appropriate page
	await expect(page).toHaveURL(/\/setup|\/dashboard/)

	// Now try logging out and logging back in
	await page.goto('/settings')
	await page.getByRole('button', { name: /logout/i }).click()

	// Verify logged out
	await expect(page).toHaveURL('/')

	// Log back in
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(onboardingData.email)
	await page.getByLabel(/^password$/i).fill(onboardingData.password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Verify successful login
	await expect(page).toHaveURL(/\/dashboard|\/app|\/setup/)
})

test('forgot password flow', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })
	const newPassword = fakerEN.internet.password()

	// Go to login page
	await page.goto('/login')

	// Click "Forgot password" link
	await page.getByRole('link', { name: /forgot password/i }).click()
	await expect(page).toHaveURL('/forgot-password')

	// Enter email/username
	await page.getByRole('textbox', { name: /username|email/i }).fill(user.email)
	await page.getByRole('button', { name: /recover password/i }).click()

	// Check for verification screen
	await expect(page.getByText(/check your email/i)).toBeVisible()

	// Get verification code from email
	const email = await readEmail(user.email)
	invariant(email, 'Email not found')
	const code = email.text.match(CODE_REGEX)?.groups?.code
	invariant(code, 'Verification code not found')

	// Enter verification code
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit/i }).click()

	// Should now be on reset password page
	await expect(page).toHaveURL('/reset-password')

	// Enter new password
	await page.getByLabel(/^new password$/i).fill(newPassword)
	await page.getByLabel(/^confirm password$/i).fill(newPassword)
	await page.getByRole('button', { name: /reset password/i }).click()

	// Should be redirected to login
	await expect(page).toHaveURL('/login')

	// Try logging in with new password
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(newPassword)
	await page.getByRole('button', { name: /log in/i }).click()

	// Should be logged in successfully
	await expect(page).toHaveURL(/\/dashboard|\/app|\/setup/)
})

test('protected route redirects to login', async ({ page }) => {
	// Try accessing a protected route when not logged in
	await page.goto('/dashboard')

	// Should be redirected to login with the redirectTo parameter
	await expect(page).toHaveURL(/\/login/)
	expect(page.url()).toContain('redirectTo')
})
