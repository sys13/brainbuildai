// import { db } from '#app/utils/db.server'
// import { summary } from '#db/schema/summary'
// import { expect, test } from '#tests/playwright-utils'
// import { createTestPrd } from '#tests/setup/seed-prd'

// let prdId: string
// let seeded = false

// test.describe('PRD > Problems Section', () => {
// 	test.beforeEach(async ({ login, page }) => {
// 		if (!seeded) {
// 			const user = await login({ internal: true })
// 			prdId = await createTestPrd({
// 				tenantId: user.tenantId,
// 				userId: user.id,
// 			})
// 			await db.insert(summary).values({
// 				prdId,
// 				tenantId: user.tenantId,
// 				textDump: 'Seeding test summary',
// 			})
// 			seeded = true
// 		}
// 		await page.goto(`/PRDs/${prdId}`)

// 		// Expand the Problems section
// 		await expect(
// 			page.locator('[data-section="problems"]').getByPlaceholder('Add new...'),
// 		).toBeVisible()
// 	})

// 	test('Add a new problem', async ({ page }) => {
// 		const section = page.locator('[data-section="problems"]')
// 		await section.getByPlaceholder('Add new...').fill('Problem created in test')
// 		await section.getByRole('button', { name: 'Add' }).click()
// 		await expect(section.getByText('Problem created in test')).toBeVisible()
// 	})

// 	test('Rename a problem', async ({ page }) => {
// 		const section = page.locator('[data-section="problems"]')
// 		await section.getByPlaceholder('Add new...').fill('To be renamed')
// 		await section.getByRole('button', { name: 'Add' }).click()

// 		const parent = section.locator('a:has-text("To be renamed")').locator('..')
// 		const editButton = parent.locator('button:has([data-icon="pencil"])')
// 		await editButton.click()

// 		const input = section.locator('input[value="To be renamed"]')
// 		await input.fill('Renamed problem')
// 		await input.press('Enter')

// 		await expect(section.getByText('Renamed problem')).toBeVisible()
// 	})

// 	// test('Delete a problem', async ({ page }) => {
// 	// 	const section = page.locator('[data-section="problems"]')

// 	// 	// Add a problem to delete
// 	// 	await section.getByPlaceholder('Add new...').fill('To be deleted')
// 	// 	await section.getByRole('button', { name: 'Add' }).click()

// 	// 	// Confirm it's added
// 	// 	await expect(section.getByText('To be deleted')).toBeVisible()

// 	// 	// Hover and delete it
// 	// 	const item = section.getByText('To be deleted')
// 	// 	await item.hover()

// 	// 	const parent = item.locator('..')
// 	// 	const deleteButton = parent.locator('button:has([data-icon="trash"])')
// 	// 	await deleteButton.click()

// 	// 	// Confirm it's gone
// 	// 	await expect(section.getByText('To be deleted')).not.toBeVisible()
// 	// })

// 	// test('Accept a suggested problem', async ({ page }) => {
// 	// 	await page.getByRole('button', { name: /regenerate suggestions/i }).click()
// 	// 	await page.waitForTimeout(1000)

// 	// 	const suggested = page.locator('[data-testid=suggested-item]').first()
// 	// 	await suggested.getByRole('button', { name: /accept/i }).click()

// 	// 	const suggestionText = await suggested.textContent()
// 	// 	await expect(page.getByText(suggestionText?.trim() || '')).toBeVisible()
// 	// })

// 	// test('Regenerate suggestions again', async ({ page }) => {
// 	// 	await page.getByRole('button', { name: /regenerate suggestions/i }).click()
// 	// 	await page.waitForTimeout(1000)

// 	// 	const suggestedItems = page.locator('[data-testid=suggested-item]')
// 	// 	// await expect(suggestedItems).toHaveCountGreaterThan(0)
// 	// })
// })
