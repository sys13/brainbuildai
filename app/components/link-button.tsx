import { Link } from 'react-router'
import { Button } from '#app/components/ui/button'

export default function ButtonLink({
	children,
	to,
	...props
}: React.ComponentProps<typeof Button> & { to: string }) {
	return (
		<Link to={to}>
			<Button {...props}>{children}</Button>
		</Link>
	)
}
