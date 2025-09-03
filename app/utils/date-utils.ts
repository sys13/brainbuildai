import { format, formatDistanceToNow } from 'date-fns'

export function formatDateRelative(date: Date) {
	const diff = new Date().getTime() - date.getTime()
	const oneDay = 24 * 60 * 60 * 1000 // milliseconds in a day

	if (diff < oneDay) {
		return formatDistanceToNow(date, { addSuffix: true })
	}

	return format(date, 'MMM dd, yyyy')
}

export function formatDateTime(date: Date) {
	return format(date, 'MMM dd, yyyy h:mm a')
}
