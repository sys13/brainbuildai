import { useEffect } from 'react'
import { toast as showToast } from 'sonner'
import type { Toast } from '#app/utils/toast.server'

export function useToast(toast?: null | Toast) {
	useEffect(() => {
		if (toast) {
			setTimeout(() => {
				showToast[toast.type](toast.title, {
					description: toast.description,
					id: toast.id,
				})
			}, 0)
		}
	}, [toast])
}
