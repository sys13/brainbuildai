import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { and, count, eq, getTableColumns, gt, not } from 'drizzle-orm'
import {
	type ActionFunctionArgs,
	Link,
	type LoaderFunctionArgs,
	data,
	useFetcher,
	useLoaderData,
} from 'react-router'
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms'
import { Heading } from '#app/components/heading'
import ButtonLink from '#app/components/link-button'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { StatusButton } from '#app/components/ui/status-button'
import { requireUser, sessionKey } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { omit } from '#app/utils/lodash'
import {
	getUserImgSrc,
	invariantResponse,
	useDoubleCheck,
} from '#app/utils/misc'
import { authSessionStorage } from '#app/utils/session.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { NameSchema, UsernameSchema } from '#app/utils/user-validation'
import { user } from '#db/schema/base'
import { userImage } from '#db/schema/userImage'
import { session } from '../../../../db/schema/authentication'
import { twoFAVerificationType } from './two-factor'

const ProfileFormSchema = z.object({
	name: NameSchema.optional(),
	username: UsernameSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
	const requiredUser = await requireUser(request)
	const { id: userId } = requiredUser
	const [userResult] = await db
		.select({
			...omit(getTableColumns(user), []),
			image: { id: userImage.id },
		})
		.from(user)
		.where(and(eq(user.id, userId), eq(user.tenantId, requiredUser.tenantId)))
		.leftJoin(userImage, eq(user.id, userImage.userId))

	const numSessions = (
		await db
			.select({ count: count() })
			.from(session)
			.where(
				and(
					eq(session.userId, userResult.id),
					gt(session.expirationDate, new Date()),
				),
			)
	)[0].count

	const twoFactorVerification = await db.query.verification.findFirst({
		columns: { id: true },
		where: { target: userId, type: twoFAVerificationType },
	})

	const password = await db.query.password.findFirst({
		where: {
			userId,
			tenantId: userResult.tenantId,
		},
	})

	const roles = await db.query.userToRole.findMany({
		columns: {},
		where: { userId },
		with: { role: { columns: { id: true, name: true } } },
	})

	return {
		hasPassword: Boolean(password),
		isTwoFactorEnabled: Boolean(twoFactorVerification),
		numSessions,
		roles: roles.map(({ role }) => role),
		user: userResult,
	}
}

interface ProfileActionArgs {
	formData: FormData
	request: Request
	userId: string
}
const profileUpdateActionIntent = 'update-profile'
const signOutOfSessionsActionIntent = 'sign-out-of-sessions'
const deleteDataActionIntent = 'delete-data'

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId } = await requireUser(request)
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case deleteDataActionIntent: {
			return deleteDataAction({ formData, request, userId })
		}

		case profileUpdateActionIntent: {
			return profileUpdateAction({ formData, request, userId })
		}

		case signOutOfSessionsActionIntent: {
			return signOutOfSessionsAction({ formData, request, userId })
		}

		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export default function EditUserProfile() {
	const { hasPassword, user } = useLoaderData<typeof loader>()

	return (
		<div>
			<ButtonLink className="mb-3" to="/dashboard" variant="secondary">
				<Icon name="arrow-left">Back to dashboard</Icon>
			</ButtonLink>
			<Heading title="Settings" type="settings" />
			<div className="flex flex-col gap-12">
				<div className="flex justify-center">
					<div className="relative size-52">
						<img
							alt={user.username}
							className="size-full rounded-full object-cover"
							src={getUserImgSrc(user.image?.id)}
						/>
						<Button
							asChild
							className="absolute -right-3 top-3 flex size-10 items-center justify-center rounded-full p-0"
							variant="outline"
						>
							<Link
								aria-label="Change profile photo"
								preventScrollReset
								title="Change profile photo"
								to="photo"
							>
								<Icon className="size-4" name="camera" />
							</Link>
						</Button>
					</div>
				</div>

				<UpdateProfile />

				<div className="col-span-6 my-6 h-1 border-b-[1.5px] border-foreground/50" />
				<div className="col-span-full flex flex-col gap-6">
					<div>
						<Link to="change-email">
							<Icon name="envelope-closed">Change email from {user.email}</Icon>
						</Link>
					</div>
					{/* <div>
					<Link to="two-factor">
						{data.isTwoFactorEnabled ? (
							<Icon name="lock-closed">2FA is enabled</Icon>
						) : (
							<Icon name="lock-open-1">Enable 2FA</Icon>
						)}
					</Link>
				</div> */}
					<div>
						<Link to={hasPassword ? 'password' : 'password/create'}>
							<Icon name="dots-horizontal">
								{hasPassword ? 'Change Password' : 'Create a Password'}
							</Icon>
						</Link>
					</div>
					{/* <div>
					<Link to="connections">
						<Icon name="link-2">Manage connections</Icon>
					</Link>
				</div> */}
					{/* <div>
					<Link
						reloadDocument
						download="my-brainbuildai-data.json"
						to="/resources/download-user-data"
					>
						<Icon name="download">Download your data</Icon>
					</Link>
				</div> */}
					<SignOutOfSessions />
					{/* <DeleteData /> */}
				</div>
			</div>
		</div>
	)
}

async function profileUpdateAction({ formData, userId }: ProfileActionArgs) {
	const submission = await parseWithZod(formData, {
		async: true,
		schema: ProfileFormSchema.superRefine(async ({ username }, ctx) => {
			const existingUsername = await db.query.user.findFirst({
				columns: { id: true },
				where: { username },
			})

			if (existingUsername && existingUsername.id !== userId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this username',
					path: ['username'],
				})
			}
		}),
	})

	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}

	const { name, username } = submission.value

	await db.update(user).set({ name, username }).where(eq(user.id, userId))

	return {
		result: submission.reply(),
	}
}

function UpdateProfile() {
	const data = useLoaderData<typeof loader>()

	const fetcher = useFetcher<typeof profileUpdateAction>()

	const [form, fields] = useForm({
		constraint: getZodConstraint(ProfileFormSchema),
		defaultValue: {
			name: data.user.name ?? '',
			username: data.user.username,
		},
		id: 'edit-profile',
		lastResult: fetcher.data?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ProfileFormSchema })
		},
	})

	return (
		<fetcher.Form method="POST" {...getFormProps(form)}>
			<div className="grid grid-cols-6 gap-x-10">
				<Field
					className="col-span-3"
					errors={fields.username.errors}
					inputProps={getInputProps(fields.username, { type: 'text' })}
					labelProps={{
						children: 'Username',
						htmlFor: fields.username.id,
					}}
				/>
				<Field
					className="col-span-3"
					errors={fields.name.errors}
					inputProps={getInputProps(fields.name, { type: 'text' })}
					labelProps={{ children: 'Name', htmlFor: fields.name.id }}
				/>
			</div>

			<ErrorList errors={form.errors} id={form.errorId} />

			<div className="mt-8 flex justify-center">
				<StatusButton
					name="intent"
					size="wide"
					status={
						fetcher.state !== 'idle' ? 'pending' : (form.status ?? 'idle')
					}
					type="submit"
					value={profileUpdateActionIntent}
				>
					Save changes
				</StatusButton>
			</div>
		</fetcher.Form>
	)
}

async function signOutOfSessionsAction({ request, userId }: ProfileActionArgs) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	invariantResponse(
		sessionId,
		'You must be authenticated to sign out of other sessions',
	)
	await db
		.delete(session)
		.where(and(eq(session.userId, userId), not(eq(session.id, sessionId))))
	return { status: 'success' } as const
}

function SignOutOfSessions() {
	const data = useLoaderData<typeof loader>()
	const dc = useDoubleCheck()

	const fetcher = useFetcher<typeof signOutOfSessionsAction>()
	const otherSessionsCount = data.numSessions - 1
	return (
		<div>
			{otherSessionsCount ? (
				<fetcher.Form method="POST">
					<StatusButton
						{...dc.getButtonProps({
							name: 'intent',
							type: 'submit',
							value: signOutOfSessionsActionIntent,
						})}
						status={
							fetcher.state !== 'idle'
								? 'pending'
								: (fetcher.data?.status ?? 'idle')
						}
						variant={dc.doubleCheck ? 'destructive' : 'default'}
					>
						<Icon name="avatar">
							{dc.doubleCheck
								? 'Are you sure?'
								: `Sign out of ${otherSessionsCount} other sessions`}
						</Icon>
					</StatusButton>
				</fetcher.Form>
			) : (
				<Icon name="avatar">This is your only session</Icon>
			)}
		</div>
	)
}

async function deleteDataAction({ userId }: ProfileActionArgs) {
	await db.delete(user).where(eq(user.id, userId))
	return redirectWithToast('/', {
		description: 'All of your data has been deleted',
		title: 'Data Deleted',
		type: 'success',
	})
}

// function DeleteData() {
// 	const dc = useDoubleCheck()

// 	const fetcher = useFetcher<typeof deleteDataAction>()
// 	return (
// 		<div>
// 			<fetcher.Form method="POST">
// 				<AuthenticityTokenInput />
// 				<StatusButton
// 					{...dc.getButtonProps({
// 						type: 'submit',
// 						name: 'intent',
// 						value: deleteDataActionIntent,
// 					})}
// 					variant={dc.doubleCheck ? 'destructive' : 'default'}
// 					status={fetcher.state !== 'idle' ? 'pending' : 'idle'}
// 				>
// 					<Icon name="trash">
// 						{dc.doubleCheck ? `Are you sure?` : `Delete all your data`}
// 					</Icon>
// 				</StatusButton>
// 			</fetcher.Form>
// 		</div>
// 	)
// }
