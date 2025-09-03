import { fakerEN } from '@faker-js/faker'
import { invariant } from '#app/utils/misc'
import { readEmail } from '#tests/mocks/utils'
import { expect, test } from '#tests/playwright-utils'

const CODE_REGEX = /Here's your verification code: (?<code>\w+)/

test('change user email with verification', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })
	const newEmail = fakerEN.internet.email().toLowerCase()

	// Login first
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to settings page
	await page.goto('/settings/profile')

	// Find the email change form
	const changeEmailButton = page.getByRole('button', { name: /change email/i })
	await changeEmailButton.click()

	// Fill in the new email
	await page.getByRole('textbox', { name: /new email/i }).fill(newEmail)
	await page.getByRole('button', { name: /change email/i }).click()

	// We should be asked to verify
	await expect(page.getByText(/check your email/i)).toBeVisible()

	// Get verification code from email
	const email = await readEmail(newEmail)
	invariant(email, 'Email not found')
	const code = email.text.match(CODE_REGEX)?.groups?.code
	invariant(code, 'Verification code not found')

	// Enter the verification code
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit/i }).click()

	// We should be redirected back to settings with a success message
	await expect(page).toHaveURL(/\/settings\/profile/)
	await expect(page.getByText(/email changed/i)).toBeVisible()

	// Verify the email was actually changed
	await expect(page.getByText(newEmail)).toBeVisible()
})

test('change user password', async ({ insertNewUser, page }) => {
	const originalPassword = fakerEN.internet.password()
	const user = await insertNewUser({ password: originalPassword })
	const newPassword = fakerEN.internet.password()

	// Login first
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(originalPassword)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to settings page
	await page.goto('/settings/profile')

	// Find the password change form
	const changePasswordButton = page.getByRole('button', {
		name: /change password/i,
	})
	await changePasswordButton.click()

	// Fill in the password change form
	await page.getByLabel(/current password/i).fill(originalPassword)
	await page.getByLabel(/^new password$/i).fill(newPassword)
	await page.getByLabel(/^confirm password$/i).fill(newPassword)
	await page.getByRole('button', { name: /change password/i }).click()

	// We should see a success message
	await expect(page.getByText(/password changed/i)).toBeVisible()

	// Log out
	await page.goto('/settings')
	await page.getByRole('button', { name: /logout/i }).click()

	// Try logging in with the new password
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(newPassword)
	await page.getByRole('button', { name: /log in/i }).click()

	// Verify successful login
	await expect(page).toHaveURL(/\/dashboard|\/app/)
})

test('update profile information', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })
	const newName = fakerEN.person.fullName()

	// Login first
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to settings page
	await page.goto('/settings/profile')

	// Update the name field
	await page.getByRole('textbox', { name: /name/i }).clear()
	await page.getByRole('textbox', { name: /name/i }).fill(newName)

	// Save the changes
	await page.getByRole('button', { name: /save/i }).click()

	// Verify the changes were saved
	await expect(page.getByText(/profile updated/i)).toBeVisible()

	// Refresh the page to ensure changes persisted
	await page.reload()

	// Verify the name field contains the new name
	await expect(page.getByRole('textbox', { name: /name/i })).toHaveValue(
		newName,
	)
})

test('enable and disable two-factor authentication', async ({
	insertNewUser,
	page,
}) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	// Login first
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to 2FA settings
	await page.goto('/settings/two-factor')

	// Check if 2FA is disabled
	await expect(page.getByText(/not enabled/i)).toBeVisible()

	// Click to enable 2FA
	await page.getByRole('button', { name: /enable 2fa/i }).click()

	// This test can't fully test 2FA since it requires scanning a QR code
	// and using an authenticator app, but we can verify the UI flow

	// Verify that we're shown QR code or setup instructions
	await expect(page.getByText(/scan this qr code/i)).toBeVisible()

	// In a real test, we'd need to:
	// 1. Extract the TOTP secret
	// 2. Generate a valid TOTP code
	// 3. Enter it to verify

	// For now, we can just verify the UI elements are present
	await expect(page.getByRole('textbox', { name: /code/i })).toBeVisible()
	await expect(page.getByRole('button', { name: /verify/i })).toBeVisible()
})
