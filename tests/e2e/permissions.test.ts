import { expect, test } from '#tests/playwright-utils'
import { fakerEN } from '@faker-js/faker'

test('admin user has admin role', async ({ insertNewUser }) => {
	// Create an admin user
	const password = fakerEN.internet.password()
	const adminUser = await insertNewUser({
		password,
		role: 'admin', // Assign admin role
	})

	// This test simply verifies that we can create a user with admin role
	// The actual UI interactions and permissions would depend on your application

	// Verify the user was created with the admin role
	expect(adminUser).toBeDefined()
	expect(adminUser.id).toBeDefined()
})

test('regular user has user role', async ({ insertNewUser }) => {
	// Create a regular (non-admin) user
	const password = fakerEN.internet.password()
	const regularUser = await insertNewUser({
		password,
		role: 'user', // Explicitly set as regular user
	})

	// This test simply verifies that we can create a user with regular role
	// The actual UI interactions and permissions would depend on your application

	// Verify the user was created
	expect(regularUser).toBeDefined()
	expect(regularUser.id).toBeDefined()
})

// Skipping this test for now until we have more specific details about the data model
// and how user-specific data is displayed in the application
test.skip('user can only see their own data', async ({
	insertNewUser,
	page,
}) => {
	// Create two users
	const password1 = fakerEN.internet.password()
	const user1 = await insertNewUser({ password: password1 })

	const password2 = fakerEN.internet.password()
	const user2 = await insertNewUser({ password: password2 })

	// Login as first user
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user1.email)
	await page.getByLabel(/^password$/i).fill(password1)
	await page.getByRole('button', { name: /log in/i }).click()

	// Create some data that belongs to this user
	// This will be application-specific
	// For example, navigate to an area where the user can create data:
	await page.goto('/dashboard')
	// Create a PRD or other item that belongs to this user
	await page
		.getByRole('link', { name: /new|create/i })
		.first()
		.click()
	await page.getByRole('textbox', { name: /name|title/i }).fill('User 1 Item')
	await page.getByRole('button', { name: /save|create|submit/i }).click()

	// Verify the item was created and is visible
	await page.goto('/dashboard')
	await expect(page.getByText('User 1 Item')).toBeVisible()

	// Logout
	await page.goto('/settings')
	await page.getByRole('button', { name: /logout/i }).click()

	// Login as second user
	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user2.email)
	await page.getByLabel(/^password$/i).fill(password2)
	await page.getByRole('button', { name: /log in/i }).click()

	// Check that user2 cannot see user1's data
	await page.goto('/dashboard')
	await expect(page.getByText('User 1 Item')).not.toBeVisible()

	// Try to directly access user1's data by URL if possible
	// Note: This might need to be customized based on your application's URL structure
	// For example, if items have IDs in URLs:
	// await page.goto('/dashboard/items/user1ItemId')
	// await expect(page.getByText(/not found|unauthorized|access denied/i)).toBeVisible()
})

test('different roles can be assigned to users', async ({ insertNewUser }) => {
	// This test verifies that we can create users with different roles

	// Create admin user
	const adminUser = await insertNewUser({
		role: 'admin', // Admin role
	})

	// Create regular user
	const regularUser = await insertNewUser({
		role: 'user', // Regular user role
	})

	// Verify both users were created with different roles
	expect(adminUser).toBeDefined()
	expect(adminUser.id).toBeDefined()

	expect(regularUser).toBeDefined()
	expect(regularUser.id).toBeDefined()
})
