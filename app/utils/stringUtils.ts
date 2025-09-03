export function toTitleCase(input: string): string {
	// Regular expression to identify words in camelCase or lowercase
	const wordRegex = /[A-Z]?[^A-Z]*/g
	const matches = input.match(wordRegex)
	// Split the input into words based on the regex

	if (!matches) {
		return input
	}

	return (
		// Filter out empty strings that may result from the split
		matches
			.filter(Boolean)
			// Capitalize the first letter of each word
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			// Join the words with a space
			.join(' ')
	)
}

export function cutOffAfterNewLines(text: string, maxNewLines: number): string {
	let newlineCount = 0
	let cutoffIndex = text.length

	for (let i = 0; i < text.length; i++) {
		if (text.charAt(i) === '\n') {
			newlineCount++
			if (newlineCount === maxNewLines) {
				// Set cutoff index to the position right after the specified number of newlines
				cutoffIndex = i + 1
				break
			}
		}
	}

	return text.substring(0, cutoffIndex)
}
