import { z } from 'zod'

export interface Grant {
	principal:
		| {
				id: 'customer_users'
				label?: string
				type: 'special'
		  }
		| {
				id: string
				label?: string
				type: 'customerTeam' | 'user'
		  }
	privilege: keyof typeof PERMISSION_LEVELS
}

type PermissionLevel = Record<string, { label: string }>

export const PERMISSION_LEVELS = {
	edit: { label: 'Edit' },
	read: { label: 'Read' },
} as const satisfies PermissionLevel

const specialPrincipalSchema = z.object({
	id: z.enum(['customer_users']),
	label: z.string().optional(),
	type: z.literal('special'),
})

const otherPrincipalSchema = z.object({
	id: z.string(),
	label: z.string().optional(),
	type: z.enum(['user']),
})

export const grantsSchema = z.array(
	z.object({
		principal: z.union([specialPrincipalSchema, otherPrincipalSchema]),
		privilege: z.enum(['read', 'edit']),
	}),
)
