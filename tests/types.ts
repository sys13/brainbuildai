export interface User {
	email: string
	id: string
	name: null | string
	tenantId: string
	username: string
}

export interface GetOrInsertUserOptions {
	email?: User['email']
	id?: string
	internal?: boolean
	password?: string
	tenantId?: string
	username?: User['username']
	completedOnboarding?: boolean
}
