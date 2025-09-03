import { Readability } from '@mozilla/readability'
import { eq } from 'drizzle-orm'
import { JSDOM } from 'jsdom'
import { type Page, chromium } from 'playwright'
import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import { tenant } from '#db/schema/base'
import { job } from '#db/schema/job'
import { persona } from '#db/schema/persona'
import { product } from '#db/schema/product'
import { db } from './db.server'
import { getOpenAIStructuredOutputs } from './open-ai-mock'

const schema = z.object({
	descriptionSummary: z.string(),
	personas: z.array(z.string()),
	goals: z.array(z.string()),
	problems: z.array(z.string()),
	products: z.array(z.string()),
})

export async function parseWebsite({
	jobId,
	companyWebsite,
	tenantId,
}: { jobId: string; companyWebsite: string; tenantId: string }) {
	await new Promise((resolve) => setTimeout(resolve, 4000))

	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext({ strictSelectors: false })
	let page = await context.newPage()

	let fullUrl = getFullUrl(companyWebsite)

	if (!fullUrl) {
		console.error('Invalid URL:', companyWebsite)
		await browser.close()
		return
	}

	try {
		await page.goto(fullUrl, { timeout: 8000 })
	} catch (error) {
		console.error('Initial page load failed:', error)

		if (!fullUrl.includes('www')) {
			const fallbackUrl = `https://www.${fullUrl.replace(/^https?:\/\//, '')}`

			await page.close()
			const newPage = await browser.newPage()
			await newPage.goto(fallbackUrl, { timeout: 8000 })

			page = newPage
			fullUrl = fallbackUrl
		} else {
			throw error
		}
	}

	const { data, error } = await parsePage({ page, url: fullUrl })

	if (error) {
		console.error(error)
		await browser.close()
		return
	}
	if (data) {
		const results = await getOpenAIStructuredOutputs(
			'You are a helpful product manager for a software company. Provide info about the ',
			`Here is the company website:
			${data.title}
			${data.content}
			`,
			schema,
			'companyContext',
		)
		await db
			.update(job)
			.set({
				status: 'complete',
				data: results,
			})
			.where(filterById({ id: jobId, tenantId }))

		const { products, personas, descriptionSummary } = schema.parse(results)

		await db
			.insert(product)
			.values(products.map((name) => ({ name, tenantId })))
		await db
			.insert(persona)
			.values(personas.map((name) => ({ name, tenantId })))
		await db
			.update(tenant)
			.set({ description: descriptionSummary })
			.where(eq(tenant.id, tenantId))
	}

	await browser.close()

	// await db
	// 	.update(job)
	// 	.set({
	// 		status: 'complete',
	// 		data: {
	// 			personas: ['Persona 1', 'Persona 2'],
	// 			products: ['Product 1', 'Product 2'],
	// 		},
	// 	})
	// 	.where(filterById({ id: jobId, tenantId }))
}

export async function parsePage({ page, url }: { page: Page; url: string }) {
	await page.goto(url)

	// Get the page content
	const html = await page.content()

	// todo: sanitize with https://github.com/cure53/DOMPurify

	// Use JSDOM to parse the HTML
	const dom = new JSDOM(html, { url })

	// Extract all links from the DOM
	// const links = getLinks(dom)

	// Apply Readability.js
	const reader = new Readability(dom.window.document)
	const article = reader.parse()

	if (!article) {
		return { error: 'Could not extract main content.' }
	}

	return { data: { title: article.title, content: article.content } }
}

function getLinks(dom: JSDOM): string[] {
	const links = Array.from(dom.window.document.querySelectorAll('a'))
		.map((link) => link.href)
		.filter((href) => href.startsWith('http'))
	return links
}

function getFullUrl(url: string) {
	// if the url is already a full url, return it
	if (url.startsWith('http')) {
		return url
	}

	// if it starts with www, add https://
	if (url.startsWith('www')) {
		return `https://${url}`
	}
	// if it starts with a domain, add https://
	if (url.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
		return `https://${url}`
	}
	// if it starts with a domain and a path, add https://
	if (url.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/.*/)) {
		return `https://${url}`
	}

	return null
}
