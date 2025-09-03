import { createCookie } from 'react-router'

export const sidebarState = createCookie('sidebar_state', {
	maxAge: 604_800, // one week
})
