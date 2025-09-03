import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	type ActionFunctionArgs,
	data,
	redirect,
	useFetcher,
	useFetchers,
} from 'react-router'
import { ServerOnly } from 'remix-utils/server-only'
import { z } from 'zod'
import { DropdownMenuItem } from '#app/components/ui/dropdown-menu'
import { Icon, type IconName } from '#app/components/ui/icon'
import { useHints, useOptionalHints } from '#app/utils/client-hints'
import { useOptionalRequestInfo, useRequestInfo } from '#app/utils/request-info'
import { type Theme, setTheme } from '#app/utils/theme.server'

const ThemeFormSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']),
	// this is useful for progressive enhancement
	redirectTo: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	invariantResponse(submission.status === 'success', 'Invalid theme received')

	const { redirectTo, theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}
	if (redirectTo) {
		return redirect(redirectTo, responseInit)
	}
	return data({ result: submission.reply() }, responseInit)
}

type Modes = Record<'system' | Theme, { icon: IconName; name: string }>

const modes: Modes = {
	dark: { icon: 'moon', name: 'Dark' },
	light: { icon: 'sun', name: 'Light' },
	system: { icon: 'laptop', name: 'System' },
}

export function ThemeSwitch({
	sidebar,
	userPreference,
}: {
	sidebar?: boolean
	userPreference?: null | Theme
}) {
	const fetcher = useFetcher<typeof action>()
	const requestInfo = useRequestInfo()

	const [form] = useForm({
		id: 'theme-switch',
		lastResult: fetcher.data?.result,
	})

	const optimisticMode = useOptimisticThemeMode()
	const mode = optimisticMode ?? userPreference ?? 'system'
	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'

	if (sidebar) {
		return (
			<DropdownMenuItem
				className="cursor-pointer"
				onClick={() => {
					fetcher.submit(
						{ theme: nextMode },
						{
							action: '/resources/theme-switch',
							method: 'POST',
						},
					)
				}}
			>
				<Icon className="mr-1" name={modes[mode].icon}>
					Theme: {modes[mode].name}
				</Icon>
			</DropdownMenuItem>
		)
	}

	return (
		<fetcher.Form
			method="POST"
			{...getFormProps(form)}
			action="/resources/theme-switch"
		>
			<ServerOnly>
				{() => (
					<input name="redirectTo" type="hidden" value={requestInfo.path} />
				)}
			</ServerOnly>
			<input name="theme" type="hidden" value={nextMode} />
			<div className="flex gap-2">
				<button
					className="flex h-8 w-8 cursor-pointer items-center justify-center"
					type="submit"
				>
					<Icon name={modes[mode].icon}>
						<span className="sr-only">{modes[mode].name}</span>
					</Icon>
				</button>
			</div>
		</fetcher.Form>
	)
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(
		(f) => f.formAction === '/resources/theme-switch',
	)

	if (themeFetcher?.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}
	return requestInfo.userPrefs.theme ?? hints.theme
}

export function useOptionalTheme() {
	const optionalHints = useOptionalHints()
	const optionalRequestInfo = useOptionalRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? optionalHints?.theme : optimisticMode
	}
	return optionalRequestInfo?.userPrefs.theme ?? optionalHints?.theme
}
