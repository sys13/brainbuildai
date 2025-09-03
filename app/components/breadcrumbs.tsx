import { Link } from 'react-router'
import { Icon, type IconName } from './ui/icon'

export type Breadcrumb = ({ icon: IconName } | { title: string }) & {
	url: string
}

interface Props {
	breadcrumbs: Breadcrumb[]
	homeUrl: string
	noHome: boolean
}

export function Breadcrumbs({
	breadcrumbs,
	homeUrl,
	noHome,
}: Props): React.ReactNode {
	return (
		<div className="flex text-secondary-foreground/80">
			{!noHome ? (
				<Crumb icon="home" url={homeUrl} />
			) : (
				<div className="size-6" />
			)}
			{breadcrumbs.map(({ url, ...crumb }) => {
				const props = { url, withSeparator: true }

				const title = 'title' in crumb ? crumb.title : null
				const icon = 'icon' in crumb ? crumb.icon : null

				if (!title && !icon) {
					return null
				}

				if (title) {
					return <Crumb key={title} {...{ title, ...props }} />
				}

				if (icon) {
					return <Crumb key={icon} {...{ icon, ...props }} />
				}

				return null
			})}
		</div>
	)
}

function Crumb({
	url,
	withSeparator = false,
	...crumb
}: Breadcrumb & {
	withSeparator?: boolean
}) {
	return (
		<div className="flex gap-2">
			{withSeparator ? <span className="ml-2">/</span> : null}
			<Link to={url}>
				{'title' in crumb
					? crumb.title.length > 20
						? `${crumb.title.substring(0, 20)}...`
						: crumb.title
					: null}
				{'icon' in crumb ? <Icon className="mb-0.5" name={crumb.icon} /> : null}
			</Link>
		</div>
	)
}
