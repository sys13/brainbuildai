import { reactRouter } from '@react-router/dev/vite'
import { sentryReactRouter } from '@sentry/react-router'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const MODE = process.env.NODE_ENV

const sentryConfig = {
	authToken: process.env.SENTRY_AUTH_TOKEN,
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	unstable_sentryVitePluginOptions: {
		release: {
			name: process.env.COMMIT_SHA,
			setCommits: {
				auto: true,
			},
		},
		sourcemaps: {
			filesToDeleteAfterUpload: ['./build/**/*.map', '.server-build/**/*.map'],
		},
	},
}

export default defineConfig((config) => {
	return {
		build: {
			target: 'es2022',
			cssMinify: MODE === 'production',

			rollupOptions: {
				external: [/node:.*/, 'fsevents'],
			},

			assetsInlineLimit: (source) => {
				if (
					source.endsWith('favicon.svg') ||
					source.endsWith('apple-touch-icon.png')
				) {
					return false
				}
			},

			sourcemap: true,
		},
		server: {
			watch: {
				ignored: ['**/playwright-report/**'],
			},
		},
		plugins: [
			envOnlyMacros(),
			tailwindcss(),
			iconsSpritesheet({
				inputDir: './other/svg-icons',
				outputDir: './app/components/ui/icons',
				fileName: 'sprite.svg',
				withTypes: true,
				iconNameTransformer: (name) => name,
			}),
			// it would be really nice to have this enabled in tests, but we'll have to
			// wait until https://github.com/remix-run/remix/issues/9871 is fixed
			MODE === 'test' ? null : reactRouter(),
			MODE === 'production' && process.env.SENTRY_AUTH_TOKEN
				? sentryReactRouter(sentryConfig, config)
				: null,
		],
		test: {
			include: ['./app/**/*.test.{ts,tsx}'],
			setupFiles: ['./tests/setup/setup-test-env.ts'],
			globalSetup: ['./tests/setup/global-setup.ts'],
			restoreMocks: true,
			coverage: {
				include: ['app/**/*.{ts,tsx}'],
				all: true,
			},
		},
	}
})
