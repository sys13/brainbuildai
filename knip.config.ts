import type { KnipConfig } from 'knip'

const config: KnipConfig = {
	// entry
	ignoreBinaries: ['fly'],
	ignoreExportsUsedInFile: { interface: true, type: true },
	// project: [''],
}
export default config
