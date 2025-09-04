import { z } from 'zod'
import { feature } from '#db/schema/feature'
import { goal } from '#db/schema/goal'
import { persona } from '#db/schema/persona'
import { prd } from '#db/schema/prd'
import { prdUserInterview } from '#db/schema/prd_user_interview'
import { prdPersona } from '#db/schema/prdPersona.js'
import { problem } from '#db/schema/problem'
import { product } from '#db/schema/product'
import { risk } from '#db/schema/risk'
import { role } from '#db/schema/role'
import { share } from '#db/schema/share.js'
import { shareEmail } from '#db/schema/shareEmail.js'
import { story } from '#db/schema/story'
import { success_criteria } from '#db/schema/success_criteria'
import { ticket } from '#db/schema/ticket'
import { userInterview } from '#db/schema/userInterview.js'
import type { modelNames } from './modelNames'
import {
	genProps,
	type Model,
	schemas,
	ticketSchema,
	userInterviewSchema,
} from './modelUtils'

export const models = {
	persona: {
		...genProps('persona', { inProject: false }),
		drizzleSchema: persona,
		helpText: 'Personas are the types of users that use your product',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			// prdId: z.string(),
		}),
		starable: true,
	},
	userInterview: {
		...genProps('userInterview', { inProject: false }),
		drizzleSchema: userInterview,
		helpText:
			'Customer interviews capture real-world insights from users or prospects to inform product decisions, validate assumptions, and identify opportunities.',
		icon: 'square-user-round',
		inProject: true,
		relations: {},
		schema: z.object({
			...userInterviewSchema,
			// prdId: z.string(),
		}),
		starable: true,
	},
	risk: {
		...genProps('risk', { inProject: false }),
		drizzleSchema: risk,
		helpText:
			'Risks represent potential challenges or obstacles that could prevent your product from achieving its goals.',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	goal: {
		...genProps('goal', { inProject: false }),
		drizzleSchema: goal,
		helpText:
			'Goals represent the outcomes your users are trying to achieve with your product',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	story: {
		...genProps('story', { inProject: false }),
		drizzleSchema: story,
		helpText:
			'User stories represent the specific tasks users perform to achieve their goals with your product.',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	problem: {
		...genProps('problem', { inProject: false }),
		drizzleSchema: problem,
		helpText:
			'Problems represent the challenges or pain points your users face that your product should solve',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	success_criteria: {
		...genProps('success_criteria', { inProject: false }),
		drizzleSchema: success_criteria,
		helpText:
			'Success criteria define measurable outcomes or conditions that indicate whether a goal or feature has been successfully achieved',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	feature: {
		...genProps('feature', { inProject: false }),
		drizzleSchema: feature,
		helpText:
			'Features are specific functionalities or capabilities of your product that help users achieve their goals or solve problems',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	prdPersona: {
		...genProps('prdPersona', { inProject: true }),
		drizzleSchema: prdPersona,
		helpText: 'Personas are the types of users that use your product',
		icon: 'square-user-round',
		inProject: true,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	prdUserInterview: {
		...genProps('prdUserInterview', { inProject: true }),
		drizzleSchema: prdUserInterview,
		helpText:
			'Links user interviews to a PRD, helping you connect real customer insights to product requirements.',
		icon: 'square-user-round',
		inProject: true,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	product: {
		...genProps('product', { inProject: false }),
		drizzleSchema: product,
		helpText:
			'Products represent the core offerings that solve user problems and deliver value',
		icon: 'box',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
			// prdId: z.string(),
		}),
		starable: true,
	},
	prd: {
		...genProps('prd', { inProject: false, namePlural: 'PRDs' }),
		displayNames: {
			plural: 'PRDs',
			singular: 'PRD',
			lowerPlural: 'prds',
			lower: 'prd',
		},
		drizzleSchema: prd,
		helpText: 'Projects are a collection of tasks for a customer',
		icon: 'square-kanban',
		inProject: false,
		relations: {
			// ...hasMany('task'),
			// ...manyToMany('tag', tagToProject),
		},
		schema: z.object({
			...schemas,
			// ...hasMany('feature'),
		}),
		starable: true,
	},
	role: {
		...genProps('role', { inProject: false, isAdmin: true }),
		drizzleSchema: role,
		helpText: 'User roles',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: z.object({
			...schemas,
		}),
	},
	share: {
		...genProps('share', { inProject: true }),
		drizzleSchema: share,
		helpText: 'Share options allow user to share PRD with other persons',
		icon: 'square-user-round',
		inProject: true,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
	},
	shareEmail: {
		...genProps('shareEmail', { inProject: true }),
		drizzleSchema: shareEmail,
		helpText: 'Personas are the types of users that use your product',
		icon: 'square-user-round',
		inProject: true,
		relations: {},
		schema: z.object({
			...schemas,
			prdId: z.string(),
		}),
		starable: true,
		displayNames: {
			plural: 'emails',
			singular: 'email',
			lowerPlural: 'emails',
			lower: 'email',
		},
	},
	ticket: {
		...genProps('ticket', { inProject: false }),
		drizzleSchema: ticket,
		helpText: 'Tickets for integrating with third party modules',
		icon: 'square-user-round',
		inProject: false,
		relations: {},
		schema: ticketSchema,
		starable: true,
	},
} as const satisfies { [K in (typeof modelNames)[number]]: Model<K> }
