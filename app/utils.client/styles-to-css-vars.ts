export interface Style {
	name: string
	value: string
}

export function stylesToCssVars(styles: Style[]) {
	return styles.map(({ name, value }) => `--${name}: ${value};`).join('\n')
}
