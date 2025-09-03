import 'dotenv/config'
import * as fs from 'node:fs'
import sourceMapSupport from 'source-map-support'

sourceMapSupport.install({
	retrieveSourceMap(source) {
		// get source file without the `file://` prefix or `?t=...` suffix
		const match = source.match(/^file:\/\/(.*)\?t=[.\d]+$/)
		if (match) {
			return {
				map: fs.readFileSync(`${match[1]}.map`, 'utf8'),
				url: source,
			}
		}

		return null
	},
})

if (process.env.MOCKS === 'true') {
	await import('./tests/mocks/index.js')
}

if (process.env.NODE_ENV === 'production') {
	await import('./server-build/index.js')
} else {
	await import('./server/index.js')
}
