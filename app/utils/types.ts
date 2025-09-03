export interface ItemMaySuggested {
	flushedOut?: boolean
	id: string
	isSuggested?: boolean | null
	name: string
}

export interface ExistingAndSuggested {
	createdAt: Date
	id: string
	isAccepted: boolean | null
	isAddedManually: boolean | null
	isSuggested: boolean
	name: string
	suggestedDescription?: null | Promise<null | string> | string
	updatedAt: Date
}

export interface ExistingSummary {
	textDump: string | null
}

export const _TIERS = ['enterprise', 'free', 'pro'] as const
export type Tier = (typeof _TIERS)[number]
