import { z } from 'zod'

const schema = z.object({
	DATABASE_URL: z.string(),
	DEMO_TOKEN_SALT: z.string(),
	HONEYPOT_SECRET: z.string(),
	INTERNAL_COMMAND_TOKEN: z.string(),
	JWT_SECRET: z.string(),
	MOCK_AI: z.string().default('false'),
	NODE_ENV: z.enum(['production', 'development', 'test'] as const),
	PAGE_EXPORTER_SECRET: z.string(),
	SESSION_SECRET: z.string(),
	STRIPE_ENDPOINT_KEY: z.string().default(''),
	STRIPE_SECRET_KEY: z.string().default(''),
	TOKEN_SALT: z.string(),
	// If you plan on using Sentry, uncomment this line
	SENTRY_DSN: z.string(),
	// If you plan to use Resend, uncomment this line
	RESEND_API_KEY: z.string(),
	// If you plan to use GitHub auth, remove the default:
	GITHUB_CLIENT_ID: z.string().default('MOCK_GITHUB_CLIENT_ID'),
	GITHUB_CLIENT_SECRET: z.string().default('MOCK_GITHUB_CLIENT_SECRET'),
	GITHUB_TOKEN: z.string().default('MOCK_GITHUB_TOKEN'),
	OPENAI_API_KEY: z.string().default('OPENAI_API_KEY'),
})

export function init() {
	const parsed = schema.safeParse(process.env)

	if (parsed.success === false) {
		console.error(
			'❌ Invalid environment variables:',
			parsed.error.flatten().fieldErrors,
		)

		throw new Error('Invalid environment variables')
	}
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
	return {
		MODE: process.env.NODE_ENV,
		SENTRY_DSN: process.env.SENTRY_DSN,
	}
}

type ENV = ReturnType<typeof getEnv>

declare global {
	// eslint-disable-next-line no-var
	var ENV: ENV
	interface Window {
		ENV: ENV
	}
}
