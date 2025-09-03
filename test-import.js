async function test() {
	try {
		const config = await import('./vite.config.ts')
		console.log('Config imported successfully:', !!config.default)
	} catch (error) {
		console.error('Import error:', error.message)
		console.error('Stack:', error.stack)
	}
}

test()
