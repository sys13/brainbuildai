/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	css: { postcss: { plugins: [] } },
	plugins: [react()],
	test: {
		coverage: {
			all: true,
			include: ['app/**/*.{ts,tsx}', './gen-parquet/**/*.{ts, tsx}'],
		},
		globalSetup: ['./tests/setup/global-setup.ts'],
		include: ['./app/**/*.test.{ts,tsx}', './gen-parquet/**/*.test.{ts, tsx}'],
		restoreMocks: true,
		setupFiles: ['./tests/setup/setup-test-env.ts'],
	},
})
