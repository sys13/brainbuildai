import fs from 'node:fs/promises'
import path from 'node:path'

const migrationsFolder = path.join('.', 'drizzle', 'migrations')
const files = await fs.readdir(migrationsFolder)
const sqlFiles = files
	.filter((file) => file.endsWith('.sql'))
	.map((file) => path.join(migrationsFolder, file))

for (const file of sqlFiles) {
	const fileContents = await fs.readFile(file, 'utf8')

	const tablesWithRawGins = findTableNameWithVectorText(fileContents)

	const gins = tablesWithRawGins
		.map(
			(tableName) =>
				`CREATE INDEX ${tableName}_content_search_idx ON ${tableName} USING GIN (vector_text);`,
		)
		.join('\n')

	const regex =
		/"vector_text" "tsvector GENERATED ALWAYS AS \(to_tsvector\('english', name\)\) STORED"/g
	const newFileContents = fileContents.replace(
		regex,
		`"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED`,
	)

	const newContents =
		newFileContents.trimEnd() + (gins.length > 0 ? `\n${gins.trimEnd()}` : '')

	await fs.writeFile(file, newContents)
}

function findTableNameWithVectorText(input: string): string[] {
	const lines = input.split('\n')
	let tableName: null | string = null
	const foundTableNames = []

	for (const line of lines) {
		const trimmedLine = line.trim()

		// Check for CREATE TABLE line and capture table name
		if (
			trimmedLine.startsWith('CREATE TABLE IF NOT EXISTS') &&
			trimmedLine.endsWith('(')
		) {
			const match = trimmedLine.match(/"([^"]+)"/)
			if (match) {
				tableName = match[1]
			}
		}

		// Check for vector_text line
		if (
			trimmedLine ===
			'"vector_text" "tsvector GENERATED ALWAYS AS (to_tsvector(\'english\', name)) STORED"'
		) {
			if (tableName !== 'null' && tableName !== null) {
				foundTableNames.push(tableName as string)
			}
		}
	}

	return foundTableNames
}
