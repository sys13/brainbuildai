export function createAvatarName(fullName: string): string {
	const nameParts = fullName.trim().split(/\s+/) // Split by any space (handle multiple spaces)

	if (nameParts.length === 1) {
		// If there's only one name part, use the first two letters of the name
		return nameParts[0].slice(0, 2).toUpperCase()
	}

	const firstInitial = nameParts[0].charAt(0).toUpperCase()
	const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()

	return firstInitial + lastInitial
}
