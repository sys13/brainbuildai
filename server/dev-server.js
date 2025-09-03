import { watch } from 'node:fs'
import { execa } from 'execa'

// Simple debounce function
function debounce(func, wait) {
	let timeout
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout)
			func(...args)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
	}
}

if (process.env.NODE_ENV === 'production') {
	await import('../server-build/index.js')
} else {
	let serverProcess = null

	async function compileAndStart() {
		console.log('🔄 Compiling server...')

		// Stop existing server if running
		if (serverProcess) {
			serverProcess.kill()
			serverProcess = null
		}

		// Compile TypeScript
		await execa(
			'npx',
			[
				'tsc',
				'server/index.ts',
				'--target',
				'es2022',
				'--module',
				'esnext',
				'--moduleResolution',
				'bundler',
				'--outDir',
				'server-build-temp',
				'--skipLibCheck',
			],
			{
				stdio: 'inherit',
				env: {
					FORCE_COLOR: true,
					...process.env,
				},
			},
		)

		console.log('🚀 Starting dev server...')

		// Start server without file watching (we handle that ourselves)
		serverProcess = execa('node', ['--inspect', 'server-build-temp/index.js'], {
			stdio: ['ignore', 'inherit', 'inherit'],
			env: {
				FORCE_COLOR: true,
				...process.env,
			},
			windowsHide: false,
		})
	}

	// Debounced recompile function to avoid rapid restarts
	const debouncedRecompile = debounce(compileAndStart, 300)

	// Initial compilation and start
	await compileAndStart()

	// Watch for changes in server files
	const serverWatcher = watch(
		'./server',
		{ recursive: true },
		(eventType, filename) => {
			if (filename?.endsWith('.ts')) {
				console.log(`📁 Server file changed: ${filename}`)
				debouncedRecompile()
			}
		},
	)

	// Watch for changes in vite config
	const viteConfigWatcher = watch('./vite.config.ts', (eventType, filename) => {
		if (filename) {
			console.log('⚙️  Vite config changed, restarting...')
			debouncedRecompile()
		}
	})

	// Cleanup on exit
	process.on('SIGINT', () => {
		console.log('\n🛑 Shutting down...')
		if (serverProcess) {
			serverProcess.kill()
		}
		serverWatcher?.close()
		viteConfigWatcher?.close()
		process.exit(0)
	})
}
