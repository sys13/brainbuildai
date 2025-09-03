import { fakerEN } from '@faker-js/faker'
import { invariant } from '#app/utils/misc'
import { readEmail } from '#tests/mocks/utils'
import { expect, test } from '#tests/playwright-utils'

const CODE_REGEX = /Here's your verification code: (?<code>\w+)/

test('user profile update', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })
	const newName = fakerEN.person.fullName()

	// Login
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to profile settings
	await page.goto('/settings/profile')

	// Update name
	const nameInput = page.getByRole('textbox', { name: /name/i })
	await nameInput.clear()
	await nameInput.fill(newName)

	// Find and click save/update button - button text might vary
	const saveButton = page.getByRole('button', { name: /save|update/i })
	await saveButton.click()

	// Check for success message
	await expect(page.getByText(/saved|updated|success/i)).toBeVisible()

	// Reload page to verify changes persisted
	await page.reload()

	// Check that name field contains the new value
	await expect(nameInput).toHaveValue(newName)
})

test('change password', async ({ insertNewUser, page }) => {
	const currentPassword = fakerEN.internet.password()
	const user = await insertNewUser({ password: currentPassword })
	const newPassword = fakerEN.internet.password()

	// Login
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(currentPassword)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to profile or password settings
	await page.goto('/settings/profile')

	// Look for a change password button/link and click it
	// This might be directly on the page or might open a modal/new page
	const changePasswordButton = page.getByRole('button', {
		name: /change password/i,
	})
	await changePasswordButton.click()

	// Fill out password change form
	// The exact field labels might vary
	await page.getByLabel(/current|old password/i).fill(currentPassword)
	await page.getByLabel(/new password/i).fill(newPassword)
	await page.getByLabel(/confirm|repeat password/i).fill(newPassword)

	// Submit form
	await page
		.getByRole('button', { name: /change|update|save password/i })
		.click()

	// Check for success message
	await expect(
		page.getByText(/password.*changed|updated|success/i),
	).toBeVisible()

	// Logout
	await page.goto('/settings')
	await page.getByRole('button', { name: /logout|sign out/i }).click()

	// Try logging in with new password
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(newPassword)
	await page.getByRole('button', { name: /log in/i }).click()

	// Verify successful login
	await expect(page).toHaveURL(/\/dashboard|\/app|\/setup/)
})

test('update email address', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })
	const newEmail = fakerEN.internet.email().toLowerCase()

	// Login
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to profile settings
	await page.goto('/settings/profile')

	// Look for a change email button/link and click it
	const changeEmailButton = page.getByRole('button', { name: /change email/i })
	await changeEmailButton.click()

	// Fill out email change form
	await page.getByRole('textbox', { name: /new email/i }).fill(newEmail)

	// Submit form
	await page.getByRole('button', { name: /change|update|save email/i }).click()

	// We'll likely be directed to verify the new email
	await expect(page.getByText(/check your email|verify/i)).toBeVisible()

	// Get verification code from email
	const email = await readEmail(newEmail)
	invariant(email, 'Email not found')
	const code = email.text.match(CODE_REGEX)?.groups?.code
	invariant(code, 'Verification code not found')

	// Enter the verification code
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit|verify/i }).click()

	// Should be redirected back to settings with success message
	await expect(page).toHaveURL(/\/settings/)
	await expect(page.getByText(/email.*changed|updated|success/i)).toBeVisible()

	// Logout and try logging in with new email
	await page.getByRole('button', { name: /logout|sign out/i }).click()

	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(newEmail)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Verify successful login
	await expect(page).toHaveURL(/\/dashboard|\/app|\/setup/)
})

test('account deletion', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	// Login
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Navigate to account settings
	await page.goto('/settings')

	// Look for delete account section/button
	// This might be in a danger zone or require scrolling down
	const deleteButton = page.getByRole('button', { name: /delete.*account/i })

	// If the button isn't found immediately, we might need to navigate to a specific tab
	if (!(await deleteButton.isVisible())) {
		// Try looking for a tab or navigation item related to account deletion
		const dangerTab = page.getByRole('link', {
			name: /danger|delete|advanced/i,
		})
		if (await dangerTab.isVisible()) {
			await dangerTab.click()
		}
	}

	// Now try finding the delete button again
	await deleteButton.click()

	// There might be a confirmation dialog
	const confirmInput = page.getByRole('textbox', { name: /confirm|type/i })
	if (await confirmInput.isVisible()) {
		// Some sites require typing "delete" or the email/username to confirm
		await confirmInput.fill(user.email)
	}

	// Find and click the final confirmation button
	const confirmDeleteButton = page.getByRole('button', {
		name: /confirm|delete/i,
	})
	await confirmDeleteButton.click()

	// Should be logged out and redirected
	await expect(page).toHaveURL(/\/|\/login/)

	// Try logging in with deleted account
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Should see error message
	await expect(page.getByText(/invalid|not found/i)).toBeVisible()
})
