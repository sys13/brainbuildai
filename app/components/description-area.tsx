import { Link } from 'react-router'
import type { JSX } from 'react/jsx-runtime'
import { formatDateTime } from '#app/utils/date-utils'

export interface DescriptionItem {
	actionButton?: JSX.Element
	asBullets?: boolean
	title: string
	to?: string
	value?: Value
	values?: { to?: string; value: Value }[]
}

export type Value = JSX.Element | null | string

interface Props {
	className?: string
	descriptions: DescriptionItem[]
}

export default function DescriptionArea({ className, descriptions }: Props) {
	return (
		<div className={`overflow-hidden rounded-lg bg-muted shadow ${className}`}>
			<div className="border-t px-4 py-5 sm:p-0 ">
				<dl className="sm:divide-y sm:divide-secondary-foreground/10">
					{descriptions.map((item) => (
						<DescriptionItem key={item.title} {...item} />
					))}
				</dl>
			</div>
		</div>
	)
}

function DescriptionItem(item: DescriptionItem) {
	return (
		<div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
			<dt className="text-sm font-medium text-secondary-foreground">
				{item.title}
			</dt>
			<dd className="mt-1 inline text-sm sm:col-span-2 sm:mt-0">
				<Item {...item} />
			</dd>
		</div>
	)
}

export function Item({
	actionButton,
	asBullets,
	className,
	to,
	value,
	values,
}: Omit<DescriptionItem, 'title'> & { className?: string }) {
	return (
		<div className={className}>
			{value &&
				(to ? (
					<LinkItem to={to} value={value} />
				) : (
					<NonLinkItem value={value} />
				))}
			{values?.map(({ to, value }, index, array) => {
				if (asBullets) {
					return (
						<ul className="list-item list-disc" key={`${to} + ${value}`}>
							<li>
								{to ? (
									<LinkItem to={to} value={value} />
								) : (
									<NonLinkItem value={value} />
								)}
							</li>
						</ul>
					)
				}
				return (
					<span key={`${to} + ${value}`}>
						{to ? (
							<LinkItem to={to} value={value} />
						) : (
							<NonLinkItem value={value} />
						)}
						<span className="text-secondary-foreground">
							{index < array.length - 1 && array.length ? ', ' : ''}
							{index === array.length - 1 && actionButton && actionButton}
						</span>
					</span>
				)
			})}
		</div>
	)
}

function LinkItem({ to, value }: { to: string; value: Value }) {
	return (
		<Link className="link" to={to}>
			{value}
		</Link>
	)
}

function NonLinkItem({ value }: { value: Value }) {
	return <span className="text-secondary-foreground">{value}</span>
}

export function startTime(obj: { startTime: Date | null }) {
	if (!obj.startTime) {
		return null
	}

	return {
		title: 'Start Time',
		value: formatDateTime(obj.startTime),
	}
}

export function endTime(obj: { endTime: Date | null }) {
	if (!obj.endTime) {
		return null
	}

	return {
		title: 'End Time',
		value: formatDateTime(obj.endTime),
	}
}
