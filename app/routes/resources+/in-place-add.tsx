import { parseWithZod } from '@conform-to/zod'
import { useRef } from 'react'
import type { ActionFunctionArgs } from 'react-router'
import { useFetcher, useSubmit } from 'react-router'
import { z } from 'zod'
import { Input } from '#app/components/ui/input'
import { requireUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { cn, invariant } from '#app/utils/misc'
import { modelNames } from '#app/utils/modelNames'
import { models } from '#app/utils/models'
import { tenant } from '#db/schema/base'

const schema = z.object({
	isManyToMany: z.string().transform((value) => {
		if (value.toLowerCase() === 'true') {
			return true
		}
		if (value.toLowerCase() === 'false') {
			return false
		}
		throw new Error('Invalid boolean string')
	}),
	joinModelName: z.string().optional(),
	mainId: z.string(),
	mainModelName: z.enum(modelNames),
	name: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId, tenantId } = await requireUser(request)
	const formData = await request.formData()

	const submission = parseWithZod(formData, { schema })

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { isManyToMany, joinModelName, mainId, mainModelName, name } =
		submission.value

	const mainModel = models[mainModelName as keyof typeof models]

	const joinModel = models[joinModelName as keyof typeof models]

	const result = await db.transaction(async (tx) => {
		const [mainObj] = await tx
			.insert(joinModel.drizzleSchema)
			// @ts-expect-error: hi there
			.values({
				[`${mainModelName}Id`]: mainId,
				createdAt: new Date(),
				name,
				ownerId: userId,
				tenantId,
				updatedAt: new Date(),
			})
			// using customerSchema here but it is just anything that has an id and name
			.returning({ id: tenant.id, name: tenant.name })

		if (isManyToMany) {
			// @ts-expect-error: joinModelName is not defined
			const joinTable = mainModel.relations[joinModelName].joinTable
			await tx.insert(joinTable).values({
				[joinModel.idFieldName]: mainObj.id,
				[mainModel.idFieldName]: mainId,
				tenantId,
			})
		}

		return mainObj
	})

	return { result }
}

export default function InPlaceAdd<T extends keyof typeof models>({
	className,
	isManyToMany = false,
	mainId,
	mainModel,
	model,
}: {
	className?: string
	isManyToMany?: boolean
	mainId: string
	mainModel: (typeof models)[keyof typeof models]
	model: (typeof models)[T]
}) {
	const fetcher = useFetcher<typeof action>()
	const nameRef = useRef<HTMLInputElement>(null)

	const submit = useSubmit()

	return (
		<fetcher.Form
			action="/resources/in-place-add"
			className={cn('', className)}
			method="POST"
			onSubmit={(event) => {
				event.preventDefault()

				const formData = new FormData(event.currentTarget)

				submit(formData, {
					action: '/resources/in-place-add',
					flushSync: true,
					method: 'post',
					navigate: false,
				})

				invariant(nameRef.current, 'no name')
				nameRef.current.value = ''
			}}
		>
			<input name="mainId" type="hidden" value={mainId} />
			<input name="mainModelName" type="hidden" value={mainModel.name} />
			<input
				name="isManyToMany"
				type="hidden"
				value={isManyToMany.toString()}
			/>
			<input name="joinModelName" type="hidden" value={model.name} />
			<input name="intent" type="hidden" value={`add${model.name}`} />

			<Input
				className="m-1 w-[calc(100%-.5rem)] border-0"
				name="name"
				placeholder={`Type in a new ${model.displayNames.lower}...`}
				ref={nameRef}
				type="text"
			/>
		</fetcher.Form>
	)
}
