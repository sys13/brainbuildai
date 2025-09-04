import { db } from '#app/utils/db.server'
import { invariant } from '#app/utils/misc'
import { user } from '#db/schema/base'
import { readEmail } from '#tests/mocks/utils'
import { test as base, createUser, expect } from '#tests/playwright-utils'
import { fakerEN } from '@faker-js/faker'
import { eq } from 'drizzle-orm'

const URL_REGEX = /(?<url>https?:\/\/[^\s$.?#].\S*)/
const CODE_REGEX = /Here's your verification code: (?<code>\w+)/

function extractUrl(text: string) {
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
test.describe('Onboarding Flow', () => {
	test('validation errors', async ({ getOnboardingData, page }) => {
		const data = getOnboardingData()
		await page.goto('/signup')
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(
			page.getByText(/email is required|Email is invalid/i),
		).toBeVisible()

		await page.getByRole('textbox', { name: /email/i }).fill('not-an-email')
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page.getByText(/Email is invalid/i)).toBeVisible()

		await page.getByRole('textbox', { name: /email/i }).clear()
		await page.getByRole('textbox', { name: /email/i }).fill(data.email)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page.getByText(/check your email/i)).toBeVisible()

		const email = await readEmail(data.email)
		const code = email?.text?.match(CODE_REGEX)?.groups?.code
		invariant(code, 'Verification code not found')

		await page.getByRole('textbox', { name: /code/i }).fill(code)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page).toHaveURL('/onboarding')

		await page.getByRole('button', { name: /create an account/i }).click()
		// await expect(page.getByText(/required|missing|invalid/i)).toBeVisible()
		const errorMessages = page.locator('text=/required|missing|invalid/i')
		await expect(errorMessages.first()).toBeVisible()

		await page.getByRole('textbox', { name: /^name/i }).fill(data.name)
		await page.getByLabel(/^password/i).fill(data.password)
		await page.getByLabel(/^confirm password/i).fill(`${data.password}1`)
		await page.getByRole('checkbox', { name: /terms|agree/i }).click()
		await page.getByRole('button', { name: /create an account/i }).click()
		await expect(page.getByText(/passwords must match/i)).toBeVisible()

		await page.getByLabel(/^confirm password/i).fill(data.password)
		await page.getByRole('button', { name: /create an account/i }).click()
		await expect(page).toHaveURL(/\/dashboard|\/setup/)
	})

	test('with "what to build" parameter', async ({
		getOnboardingData,
		page,
	}) => {
		const data = getOnboardingData()
		const whatToBuild = 'AI assistant for email management'
		await page.goto(`/signup?whatToBuild=${encodeURIComponent(whatToBuild)}`)

		const content = await page.textContent('body')
		if (!content?.includes(whatToBuild)) {
			const hiddenInput = page.locator('input[name="whatToBuild"]')
			const value = await hiddenInput.getAttribute('value')
			expect(value).toBe(whatToBuild)
		}

		await page.getByRole('textbox', { name: /email/i }).fill(data.email)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page.getByText(/check your email/i)).toBeVisible()

		const email = await readEmail(data.email)
		const code = email?.text?.match(CODE_REGEX)?.groups?.code
		invariant(code, 'Verification code not found')

		await page.getByRole('textbox', { name: /code/i }).fill(code)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page).toHaveURL('/onboarding')

		await page.getByRole('textbox', { name: /^name/i }).fill(data.name)
		await page.getByLabel(/^password/i).fill(data.password)
		await page.getByLabel(/^confirm password/i).fill(data.password)
		await page.getByRole('checkbox', { name: /terms|agree/i }).click()
		await page.getByRole('button', { name: /create an account/i }).click()
		await expect(page).toHaveURL(/\/dashboard|\/setup/)
	})

	test('cannot access onboarding without verification', async ({ page }) => {
		await page.goto('/onboarding')
		await expect(page).toHaveURL('/signup')
	})
})

test.describe('Onboarding via Email Link', () => {
	test.skip('signup with link', async ({ getOnboardingData, page }) => {
		const data = getOnboardingData()
		await page.goto('/')
		await page.getByRole('link', { name: /login/i }).click()
		await page.getByRole('link', { name: /create an account/i }).click()
		await page.getByRole('textbox', { name: /email/i }).fill(data.email)
		await page.getByRole('button', { name: /submit/i }).click()

		const email = await readEmail(data.email)
		console.log('Fetched email:', email)
		invariant(email, 'Email not found')
		const url = extractUrl(email.text)
		invariant(url, 'Onboarding URL not found')
		await page.goto(url)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page).toHaveURL('/onboarding')

		await page.getByRole('textbox', { name: /^name/i }).fill(data.name)
		await page.getByLabel(/^password/i).fill(data.password)
		await page.getByLabel(/^confirm password/i).fill(data.password)
		await page.getByLabel(/terms/i).check()
		await page.getByLabel(/remember me/i).check()
		await page.getByRole('button', { name: /create an account/i }).click()
		await expect(page).toHaveURL(/setup/)
	})

	test.skip('signup with short code', async ({ getOnboardingData, page }) => {
		const data = getOnboardingData()
		await page.goto('/signup')
		await page.getByRole('textbox', { name: /email/i }).fill(data.email)
		await page.getByRole('button', { name: /submit/i }).click()

		const email = await readEmail(data.email)
		const code = email?.text?.match(CODE_REGEX)?.groups?.code
		invariant(code, 'Verification code not found')
		await page.getByRole('textbox', { name: /code/i }).fill(code)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page).toHaveURL('/onboarding')
	})
})

test.describe('Password Reset', () => {
	test('reset with short code', async ({ insertNewUser, page }) => {
		const user = await insertNewUser()
		await page.goto('/login')
		await page.getByRole('link', { name: /forgot password/i }).click()
		await page.getByRole('textbox', { name: /username/i }).fill(user.username)
		await page.getByRole('button', { name: /recover password/i }).click()
		await expect(page.getByText(/check your email/i)).toBeVisible()

		const email = await readEmail(user.email)
		const code = email?.text?.match(CODE_REGEX)?.groups?.code
		invariant(code, 'Reset Password code not found')
		await page.getByRole('textbox', { name: /code/i }).fill(code)
		await page.getByRole('button', { name: /submit/i }).click()
		await expect(page).toHaveURL('/reset-password')
	})
})
test('signup with external provider', async ({ page }) => {
	await page.goto('/signup')
	const providerButtons = page.locator('form', {
		has: page.getByText(/github|google/i),
	})
	await expect(providerButtons).toBeVisible()
})
