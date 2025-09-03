import type { Meta } from '@sly-cli/sly'

/**
 */
export default function transformIcon(input: string, meta: Meta) {
	const transformedInput = prependLicenseInfo(input, meta)

	return transformedInput
}

function prependLicenseInfo(input: string, meta: Meta): string {
	return [
		`<!-- Downloaded from ${meta.name} -->`,
		`<!-- License ${meta.license} -->`,
		`<!-- ${meta.source} -->`,
		input,
	].join('\n')
}
