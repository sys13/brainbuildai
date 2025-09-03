import type { ModelName } from '#app/utils/modelNames'
import { models } from '#app/utils/models'
import type { IconName } from './ui/icon'

export interface NavItem {
	count?: number
	current?: boolean
	href: null | string
	icon: IconName | null
	inPRD?: boolean
	name: string
}

// marketing
const marketing = [
	{ href: '/', icon: 'home', name: 'Home' },
	// { href: '/features', icon: 'envelope-closed', name: 'Features' },
	{ href: '/pricing', icon: 'camera', name: 'Pricing' },
	{ href: '/contact', icon: 'envelope-closed', name: 'Contact' },
	{ href: '/blog', icon: 'newspaper', name: 'Blog' },
	{ href: '/login', icon: 'log-in', name: 'Login' },
	{ href: '/signup', icon: 'user-plus', name: 'Try BrainBuild' },
] satisfies NavItem[]

const internalModels: ModelName[] = ['persona']

export function internalNavItems(prdId: string): NavItem[] {
	const items: NavItem[] = internalModels.map((modelName) => {
		const model = models[modelName]
		return {
			href: model.inProject ? model.listUrl(prdId) : model.listUrl(),
			icon: 'icon' in model ? model.icon : 'check',
			inProject: true,
			name: model.displayNames.plural,
		}
	})

	return items
}

// all
export const navItems = {
	auth: marketing,
	marketing,
	other: marketing,
	internalModels,
}
