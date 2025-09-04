import { z } from 'zod'

export const UsernameSchema = z
	.string({ message: 'Username is required' })
	.min(3, { message: 'Username is too short' })
	.max(20, { message: 'Username is too long' })
	.regex(/^\w+$/, {
		message: 'Username can only include letters, numbers, and underscores',
	})
	// users can type the username in any case, but we store it in lowercase
	.transform((value) => value.toLowerCase())

export const PasswordSchema = z
	.string({ message: 'Password is required' })
	.min(6, { message: 'Password is too short' })
	.max(100, { message: 'Password is too long' })
export const NameSchema = z
	.string({ message: 'Name is required' })
	.min(3, { message: 'Name is too short' })
	.max(40, { message: 'Name is too long' })
export const EmailSchema = z
	.string({ message: 'Email is required' })
	.email({ message: 'Email is invalid' })
	.min(3, { message: 'Email is too short' })
	.max(100, { message: 'Email is too long' })
	// users can type the email in any case, but we store it in lowercase
	.transform((value) => value.toLowerCase())

export const PasswordAndConfirmPasswordSchema = z
	.object({ confirmPassword: PasswordSchema, password: PasswordSchema })
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: 'custom',
				message: 'The passwords must match',
				path: ['confirmPassword'],
			})
		}
	})
