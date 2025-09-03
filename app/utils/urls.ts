export function getSearchParams(url: string): URLSearchParams {
	// Create a new URL object from the input string
	const urlObj = new URL(url)

	// Extract the search params from the URL object and return it
	return urlObj.searchParams
}
