import { loadConfigFromFile } from 'vite'

async function testConfig() {
	try {
		console.log('Testing Vite config loading...')
		const result = await loadConfigFromFile(
			{
				command: 'serve',
				mode: 'development',
			},
			'./vite.config.ts',
		)
		console.log('Config loaded successfully:', !!result)
		if (result) {
			console.log('Config path:', result.path)
			console.log('Config dependencies:', result.dependencies)
		}
	} catch (error) {
		console.error('Failed to load config:', error.message)
		console.error('Full error:', error)
	}
}

testConfig()
