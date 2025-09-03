import path from 'node:path'
import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'
import fsExtra from 'fs-extra'
import { globSync } from 'glob'

const pkg = fsExtra.readJsonSync(path.join(process.cwd(), 'package.json'))

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...s: string[]) => path.join(__dirname, ...s)
const globsafe = (s: string) => s.replace(/\\/g, '/')

const allFiles = globSync(globsafe(here('../server/**/*.*')), {
	ignore: [
		'server/dev-server.js', // for development only
		'**/tsconfig.json',
		'**/eslint*',
		'**/__tests__/**',
	],
})

const entries = []
for (const file of allFiles) {
	if (/\.(?:ts|js|tsx|jsx)$/.test(file)) {
		entries.push(file)
	} else {
		const dest = file.replace(here('../server'), here('../server-build'))
		fsExtra.ensureDirSync(path.parse(dest).dir)
		fsExtra.copySync(file, dest)

		console.log(`copied: ${file.replace(`${here('../server')}/`, '')}`)
	}
}

console.log('building...')

esbuild
	.build({
		entryPoints: entries,
		format: 'esm',
		logLevel: 'info',
		outdir: here('../server-build'),
		platform: 'node',
		sourcemap: true,
		target: [`node${pkg.engines.node}`],
	})
	.catch((error: unknown) => {
		console.error(error)
		// eslint-disable-next-line n/no-process-exit
		process.exit(1)
	})
