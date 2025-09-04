import { db } from '#app/utils/db.server'
import { user } from '#db/schema/base'
import { test as base, createUser, expect } from '#tests/playwright-utils'
import { eq } from 'drizzle-orm'

const test = base.extend<{
	getOnboardingData(): {
		email: string
		name: string
		username: string
	}
}>({
	getOnboardingData: async ({}, use) => {
		const userData = createUser()
		await use(() => userData)
		await db.delete(user).where(eq(user.username, userData.username))
	},
})

// This test simulates a user being directed to the provider-specific onboarding
// after authenticating through a third-party provider like GitHub
test('provider-specific onboarding flow', async ({
	getOnboardingData,
	page,
}) => {
	const userData = getOnboardingData()
	const providerName = 'github'
	const _imageUrl = 'https://github.com/ghost.png'

	// We'll directly access the onboarding route since we can't fully test OAuth
	// In a real test, we'd need to mock the OAuth flow

	// Mock the verification session storage with required data
	// This would normally be set after OAuth callback

	// For testing purposes, we'll navigate directly to the onboarding page
	// This would require setting up proper session cookies in a real test
	await page.goto(`/onboarding_/${providerName}`)

	// If we can't properly set up session cookies, this test might fail
	// We'd need to check if we're redirected to login or signup

	// If the test reaches the onboarding page:
	// Verify the email is shown
	await expect(page.getByText(userData.email)).toBeVisible()

	// Fill out the onboarding form
	await page.getByRole('textbox', { name: /username/i }).fill(userData.username)
	await page.getByRole('textbox', { name: /name/i }).fill(userData.name)
	await page.getByLabel(/terms/i).check()
	await page.getByLabel(/remember me/i).check()

	// Submit the form
	await page.getByRole('button', { name: /create an account/i }).click()

	// Verify redirect (this might fail if we couldn't properly set up session cookies)
	await expect(page).toHaveURL(/\/dashboard|\/setup/)
})

// Note: This test may need additional mocking to work properly since
// the onboarding_.$provider route expects specific session data.
// A proper implementation would involve:
// 1. Setting up mock auth provider
// 2. Simulating OAuth callback
// 3. Properly setting session cookies
// For now, this test serves as a skeleton of what to test.
