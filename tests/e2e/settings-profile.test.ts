import { fakerEN as faker } from '@faker-js/faker'
import { verifyUserPassword } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { invariant } from '#app/utils/misc'
import { readEmail } from '#tests/mocks/utils'
import { createUser, expect, test, waitFor } from '#tests/playwright-utils'

const CODE_REGEX = /Here's your verification code: (?<code>\w+)/

test('Users can update their basic info', async ({ login, page }) => {
	await login()
	await page.goto('/settings')

	const newUserData = createUser()

	await page.getByRole('textbox', { name: /^name/i }).fill(newUserData.name)
	await page
		.getByRole('textbox', { name: /^username/i })
		.fill(newUserData.username)

	await page.getByRole('button', { name: /^save/i }).click()
})

test('Users can update their password', async ({ login, page }) => {
	const oldPassword = faker.internet.password()
	const newPassword = faker.internet.password()
	const user = await login({ password: oldPassword })
	await page.goto('/settings')

	await page.getByRole('link', { name: /change password/i }).click()

	await page
		.getByRole('textbox', { name: /^current password/i })
		.fill(oldPassword)
	await page.getByRole('textbox', { name: /^new password/i }).fill(newPassword)
	await page
		.getByRole('textbox', { name: /^confirm new password/i })
		.fill(newPassword)

	await page.getByRole('button', { name: /^change password/i }).click()

	await expect(page).toHaveURL('/settings')

	const { username } = user
	expect(
		await verifyUserPassword({ username }, oldPassword),
		'Old password still works',
	).toEqual(null)
	expect(
		await verifyUserPassword({ username }, newPassword),
		'New password does not work',
	).toEqual({ id: user.id, tenantId: user.tenantId })
})

test.skip('Users can update their profile photo', async ({ login, page }) => {
	const user = await login()
	await page.goto('/settings')

	const beforeSrc = await page
		.getByRole('img', { name: user.username || user.name || '' })
		.getAttribute('src')

	await page.getByRole('link', { name: /change profile photo/i }).click()

	await expect(page).toHaveURL('/settings/photo')

	await page
		.getByRole('textbox', { name: /change/i })
		.setInputFiles('./tests/fixtures/images/user/kody.png')

	await page.getByRole('button', { name: /save/i }).click()

	await expect(
		page,
		'Was not redirected after saving the profile photo',
	).toHaveURL('/settings')

	const afterSrc = await page
		.getByRole('img', { name: user.username || user.name || '' })
		.getAttribute('src')

	expect(beforeSrc).not.toEqual(afterSrc)
})

test('Users can change their email address', async ({ login, page }) => {
	const preUpdateUser = await login()
	const newEmailAddress = faker.internet.email().toLowerCase()
	expect(preUpdateUser.email).not.toEqual(newEmailAddress)
	await page.goto('/settings')
	await page.getByRole('link', { name: /change email/i }).click()
	await page.getByRole('textbox', { name: /new email/i }).fill(newEmailAddress)
	await page.getByRole('button', { name: /send confirmation/i }).click()
	await expect(page.getByText(/check your email/i)).toBeVisible()
	const email = await waitFor(() => readEmail(newEmailAddress), {
		errorMessage: 'Confirmation email was not sent',
	})
	invariant(email, 'Email was not sent')
	const codeMatch = email.text.match(CODE_REGEX)
	const code = codeMatch?.groups?.code
	invariant(code, 'Onboarding code not found')
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit/i }).click()
	await expect(page.getByText(/email changed/i)).toBeVisible()

	const updatedUser = await db.query.user.findFirst({
		columns: { email: true },
		where: { id: preUpdateUser.id },
	})

	invariant(updatedUser, 'Updated user not found')
	expect(updatedUser.email).toBe(newEmailAddress)
	const noticeEmail = await waitFor(() => readEmail(preUpdateUser.email), {
		errorMessage: 'Notice email was not sent',
	})
	expect(noticeEmail.subject).toContain('changed')
})
