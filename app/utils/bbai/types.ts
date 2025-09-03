import type { IconName } from '#app/components/ui/icon'

export interface BBAI {
	marketing: {
		benefits: { description: string; icon: IconName; title: string }[]
		description: {
			meta: string
			short: string
		}
		features: { description: string; icon: IconName; title: string }[]
		hero: {
			main: string
			sub: string
		}
		name: string
		personas: { description: string; icon: IconName; title: string }[]
	}
	websiteDomain: string
}
