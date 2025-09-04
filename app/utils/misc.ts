import { type ClassValue, clsx } from 'clsx'
import { defaultGetSrc, type GetSrcArgs } from 'openimg/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormAction, useNavigation } from 'react-router'
import { useSpinDelay } from 'spin-delay'
import { twMerge } from 'tailwind-merge'
import type { ModelName } from './modelNames'

export interface Item {
	id: string
	name: string
}

export interface ModelItem {
	id: string
	modelName: ModelName
	name: string
}

export function getUserImgSrc(imageId?: null | string) {
	return imageId ? `/resources/user-images/${imageId}` : '/img/user.png'
}

export function getErrorMessage(error: unknown) {
	if (typeof error === 'string') {
		return error
	}
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message
	}

	console.error('Unable to get error message for error', error)
	return 'Unknown Error'
}

export function getImgSrc({
	height,
	optimizerEndpoint,
	src,
	width,
	fit,
	format,
}: GetSrcArgs) {
	// We customize getImgSrc so our src looks nice like this:
	// /resources/images?objectKey=...&h=...&w=...&fit=...&format=...
	// instead of this:

	if (src.startsWith(optimizerEndpoint)) {
		const [endpoint, query] = src.split('?')
		const searchParams = new URLSearchParams(query)
		searchParams.set('h', height.toString())
		searchParams.set('w', width.toString())
		if (fit) {
			searchParams.set('fit', fit)
		}
		if (format) {
			searchParams.set('format', format)
		}
		return `${endpoint}?${searchParams.toString()}`
	}
	return defaultGetSrc({ height, optimizerEndpoint, src, width, fit, format })
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getDomainUrl(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ??
		request.headers.get('host') ??
		new URL(request.url).host
	const protocol = host.includes('localhost') ? 'http' : 'https'
	return `${protocol}://${host}`
}

export function getReferrerRoute(request: Request) {
	// spelling errors and whatever makes this annoyingly inconsistent
	// in my own testing, `referer` returned the right value, but 🤷‍♂️
	const referrer =
		request.headers.get('referer') ??
		request.headers.get('referrer') ??
		request.referrer
	const domain = getDomainUrl(request)
	if (referrer.startsWith(domain)) {
		return referrer.slice(domain.length)
	}
	return '/'
}

/**
 * Merge multiple headers objects into one (uses set so headers are overridden)
 */
export function mergeHeaders(
	...headers: (null | ResponseInit['headers'] | undefined)[]
) {
	const merged = new Headers()
	for (const header of headers) {
		if (!header) {
			continue
		}
		for (const [key, value] of new Headers(header).entries()) {
			merged.set(key, value)
		}
	}

	return merged
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
	...headers: (null | ResponseInit['headers'] | undefined)[]
) {
	const combined = new Headers()
	for (const header of headers) {
		if (!header) {
			continue
		}
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value)
		}
	}

	return combined
}

/**
 * Combine multiple response init objects into one (uses combineHeaders)
 */
export function combineResponseInits(
	...responseInits: (null | ResponseInit | undefined)[]
) {
	let combined: ResponseInit = {}
	for (const responseInit of responseInits) {
		combined = {
			...responseInit,
			headers: combineHeaders(combined.headers, responseInit?.headers),
		}
	}

	return combined
}

/**
 * Provide a condition and if that condition is falsey, this throws an error
 * with the given message.
 *
 * inspired by invariant from 'tiny-invariant' except will still include the
 * message in production.
 * @example
 * invariant(typeof value === 'string', `value must be a string`)
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 * @throws {Error} if condition is falsey
 */
export function invariant(
	condition: unknown,
	message: (() => string) | string,
): asserts condition {
	if (!condition) {
		throw new Error(typeof message === 'function' ? message() : message)
	}
}

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 * @param responseInit Additional response init options if a response is thrown
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
	condition: unknown,
	message: (() => string) | string,
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw new Response(typeof message === 'function' ? message() : message, {
			status: 400,
			...responseInit,
		})
	}
}

/**
 * Returns true if the current navigation is submitting the current route's
 * form. Defaults to the current route's form action and method POST.
 *
 * Defaults state to 'non-idle'
 *
 * NOTE: the default formAction will include query params, but the
 * navigation.formAction will not, so don't use the default formAction if you
 * want to know if a form is submitting without specific query params.
 */
export function useIsPending({
	formAction,
	formMethod = 'POST',
	state = 'non-idle',
}: {
	formAction?: string
	formMethod?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
	state?: 'loading' | 'non-idle' | 'submitting'
} = {}) {
	const contextualFormAction = useFormAction()
	const navigation = useNavigation()
	const isPendingState =
		state === 'non-idle'
			? navigation.state !== 'idle'
			: navigation.state === state
	return (
		isPendingState &&
		navigation.formAction === (formAction ?? contextualFormAction) &&
		navigation.formMethod === formMethod
	)
}

/**
 * This combines useSpinDelay (from https://npm.im/spin-delay) and useIsPending
 * from our own utilities to give you a nice way to show a loading spinner for
 * a minimum amount of time, even if the request finishes right after the delay.
 *
 * This avoids a flash of loading state regardless of how fast or slow the
 * request is.
 */
export function useDelayedIsPending({
	delay = 400,
	formAction,
	formMethod,
	minDuration = 300,
}: Parameters<typeof useIsPending>[0] &
	Parameters<typeof useSpinDelay>[1] = {}) {
	const isPending = useIsPending({ formAction, formMethod })
	const delayedIsPending = useSpinDelay(isPending, {
		delay,
		minDuration,
	})
	return delayedIsPending
}

function callAll<Args extends unknown[]>(
	...fns: (((...args: Args) => unknown) | undefined)[]
) {
	// biome-ignore lint/complexity/noForEach: <explanation>
	return (...args: Args) => fns.forEach((fn) => fn?.(...args))
}

/**
 * Use this hook with a button and it will make it so the first click sets a
 * `doubleCheck` state to true, and the second click will actually trigger the
 * `onClick` handler. This allows you to have a button that can be like a
 * "are you sure?" experience for the user before doing destructive operations.
 */
export function useDoubleCheck() {
	const [doubleCheck, setDoubleCheck] = useState(false)

	function getButtonProps(
		props?: React.ButtonHTMLAttributes<HTMLButtonElement>,
	) {
		const onBlur: React.ButtonHTMLAttributes<HTMLButtonElement>['onBlur'] =
			() => setDoubleCheck(false)

		const onClick: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'] =
			doubleCheck
				? undefined
				: (e) => {
						e.preventDefault()
						setDoubleCheck(true)
					}

		const onKeyUp: React.ButtonHTMLAttributes<HTMLButtonElement>['onKeyUp'] = (
			e,
		) => {
			if (e.key === 'Escape') {
				setDoubleCheck(false)
			}
		}

		return {
			...props,
			onBlur: callAll(onBlur, props?.onBlur),
			onClick: callAll(onClick, props?.onClick),
			onKeyUp: callAll(onKeyUp, props?.onKeyUp),
		}
	}

	return { doubleCheck, getButtonProps }
}

/**
 * Simple debounce implementation
 */
function debounce<Callback extends (...args: Parameters<Callback>) => void>(
	fn: Callback,
	delay: number,
) {
	let timer: null | ReturnType<typeof setTimeout> = null
	return (...args: Parameters<Callback>) => {
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => {
			fn(...args)
		}, delay)
	}
}

/**
 * Debounce a callback function
 */
export function useDebounce<
	Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>,
>(callback: Callback, delay: number) {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback
	})
	return useMemo(
		() =>
			debounce(
				(...args: Parameters<Callback>) => callbackRef.current(...args),
				delay,
			),
		[delay],
	)
}

export async function downloadFile(url: string, retries = 0) {
	const MAX_RETRIES = 3
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`Failed to fetch image with status ${response.status}`)
		}

		const contentType = response.headers.get('content-type') ?? 'image/jpg'
		const blob = Buffer.from(await response.arrayBuffer())
		return { blob, contentType }
	} catch (e) {
		if (retries > MAX_RETRIES) {
			throw e
		}
		return downloadFile(url, retries + 1)
	}
}

export function hasCommonElement<T>(array1: T[], array2: T[]): boolean {
	const set1 = new Set(array1)
	for (const element of array2) {
		if (set1.has(element)) {
			return true
		}
	}

	return false
}

export function decodeSearchString(encodedString: null | string): string {
	// Replace '+' with space before decoding

	// Replace '+' with space before decoding
	if (!encodedString) {
		return ''
	}

	const sanitizedText = encodedString.replace(/[!:'"&|()+]/g, ' ')

	// Split the text into words
	const words = sanitizedText.split(/\s+/)

	// Join the words with ' & ' operator
	return words.filter((word) => word.length > 0).join(' & ')
}
