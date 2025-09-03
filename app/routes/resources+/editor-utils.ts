import type { Item } from '#app/utils/misc'
import type { models } from '#app/utils/models'
import type { ExistingAndSuggestedClient } from '#app/utils/sort-objs'

export interface EditorProps<T extends (typeof models)[keyof typeof models]> {
	defaultValues?: Partial<
		Record<keyof T['relations'], string | string[] | undefined>
	>
	obj?: Partial<T['drizzleSchema']['$inferSelect']>
	relations: Record<
		keyof T['relations'],
		{
			all: Item[]
			existing?: Item | Item[]
		}
	>
}
export interface UserInterviewEditorProps<
	T extends (typeof models)[keyof typeof models],
> {
	defaultValues?: Partial<
		Record<keyof T['relations'], string | string[] | undefined>
	>
	obj?: Partial<T['drizzleSchema']['$inferSelect']>
	data: ExistingAndSuggestedClient[]
	relations: Record<
		keyof T['relations'],
		{
			all: Item[]
			existing?: Item | Item[]
		}
	>
}
