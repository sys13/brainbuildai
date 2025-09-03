import { fakerEN } from '@faker-js/faker'
import { invariant } from '#app/utils/misc'
import { expect, test } from '#tests/playwright-utils'

test('session persistence across page reloads', async ({
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

	// Verify successful login
	await expect(page).toHaveURL(/\/dashboard|\/app/)

	// Navigate to another page
	await page.goto('/settings/profile')
	await expect(page).toHaveURL('/settings/profile')

	// Reload the page to verify session persistence
	await page.reload()

	// Verify we're still logged in
	await expect(page).toHaveURL('/settings/profile')
	await expect(page.getByText(user.email)).toBeVisible()
})

test('session handling with multiple tabs', async ({
	insertNewUser,
	browser,
}) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	// Open first tab and login
	const context = await browser.newContext()
	const page1 = await context.newPage()

	await page1.goto('/login')
	await page1.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page1.getByLabel(/^password$/i).fill(password)
	await page1.getByRole('button', { name: /log in/i }).click()

	// Verify successful login in first tab
	await expect(page1).toHaveURL(/\/dashboard|\/app/)

	// Open second tab in same browser context (shares cookies)
	const page2 = await context.newPage()
	await page2.goto('/settings/profile')

	// Verify we're already logged in on the second tab
	await expect(page2).toHaveURL('/settings/profile')
	await expect(page2.getByText(user.email)).toBeVisible()

	// Logout from first tab
	await page1.goto('/settings')
	await page1.getByRole('button', { name: /logout/i }).click()

	// Verify logged out in first tab
	await expect(page1).toHaveURL('/')

	// Verify second tab is also logged out when navigating
	await page2.goto('/dashboard')
	await expect(page2).toHaveURL(/\/login/)
})

test('redirect to original destination after login', async ({
	insertNewUser,
	page,
}) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	// Try to access a protected page
	await page.goto('/dashboard')

	// Should be redirected to login
	await expect(page).toHaveURL(/\/login/)

	// Verify the URL contains the redirectTo parameter
	expect(page.url()).toContain('redirectTo=%2Fdashboard')

	// Login with credentials
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)
	await page.getByRole('button', { name: /log in/i }).click()

	// Verify we're redirected to the original destination
	await expect(page).toHaveURL('/dashboard')
})

test('session expiration behavior', async ({ insertNewUser, page }) => {
	const password = fakerEN.internet.password()
	const user = await insertNewUser({ password })

	// Login first without "remember me"
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByLabel(/^password$/i).fill(password)

	// Make sure "remember me" is NOT checked
	const rememberCheckbox = page.getByLabel(/remember me/i)
	const isChecked = await rememberCheckbox.isChecked()
	if (isChecked) {
		await rememberCheckbox.click()
	}

	await page.getByRole('button', { name: /log in/i }).click()

	// Verify successful login
	await expect(page).toHaveURL(/\/dashboard|\/app/)

	// Check the session cookie expiration
	const cookies = await page.context().cookies()
	const authCookie = cookies.find((c) => c.name.includes('auth'))
	invariant(authCookie, 'Auth cookie not found')

	// For session cookies (not "remember me"), the cookie should expire when the browser closes
	// This is represented by expiry = -1 or a time close to the current time
	// We can't fully test session expiration in an E2E test without manipulating time
	// But we can verify the cookie doesn't have a far-future expiry
	if (authCookie.expires !== -1) {
		const expiryDate = new Date(authCookie.expires * 1000)
		const oneMonthFromNow = new Date()
		oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
		// Compare Unix timestamps instead of using a non-existent matcher
		expect(expiryDate.getTime()).toBeLessThan(oneMonthFromNow.getTime())
	}
})
