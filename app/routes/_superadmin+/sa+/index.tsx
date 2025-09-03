import type { LoaderFunctionArgs } from 'react-router'
import { Link, useLoaderData } from 'react-router'
import DescriptionArea from '#app/components/description-area'
import { Heading } from '#app/components/heading'
import LinkButton from '#app/components/link-button'
import { Button } from '#app/components/ui/button'
import { Card } from '#app/components/ui/card'
import { Icon, type IconName } from '#app/components/ui/icon'
import { requireSuperAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { compact } from '#app/utils/ts-utils'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireSuperAdminUser(request)
	const tenantsRaw = await db.query.tenant.findMany({
		with: {
			prds: {
				with: {
					// events: {
					// 	columns: { details: true, id: true, name: true },
					// 	where: eq(eventSchema.name, 'new-pdf'),
					// },
					// personas: { columns: { id: true } },
				},
			},
			users: { columns: { email: true, id: true, name: true } },
		},
	})
	const tenants = tenantsRaw.filter(
		({ users }) =>
			users.length > 0 &&
			users.filter(
				(user) =>
					user.email.includes('@example.com') ||
					user.email.includes('@brainbuildai.com') ||
					user.email.includes('@typefaceexample.com'),
				// ||
				// user.email.includes('daniel.arrizza'),
			).length === 0,
	)

	return { tenants }
}

export default function Admin() {
	const { tenants } = useLoaderData<typeof loader>()
	return (
		<div className="container">
			<Heading
				homeUrl="/sa"
				rightButtons={
					<Link to="/sa/add-tenant">
						<Button variant="default">Add Tenant</Button>
					</Link>
				}
				title="Admin"
			/>
			<LinkButton to="/sa/transfer-project">Transfer Project</LinkButton>
			<div className="grid gap-4 grid-cols-2 ">
				<BrandStat
					iconName="users"
					name="Num of Tenants"
					stat={tenants.length}
				/>
				<BrandStat
					iconName="star"
					name="Pro Tenants"
					stat={tenants.filter(({ tier }) => tier === 'pro').length}
				/>
			</div>
			<div className="grid justify-between gap-4 mt-4 sm:grid-cols-2">
				{tenants.map((tenant) => (
					<Card className="p-4" key={tenant.id}>
						{tenant.users.map((user) => (
							<div key={user.id}>
								<h3>
									{user.name} - {user.email}
								</h3>
							</div>
						))}
						<DescriptionArea
							descriptions={compact([
								tenant.tier ? { title: 'Tier', value: tenant.tier } : null,
							])}
						/>
						<div className="mt-2">
							{tenant.prds.map((project) => (
								<Card className="p-2" key={project.id}>
									<h3>{project.name}</h3>
									{/* <div>{project.personas.length} personas</div> */}
								</Card>
							))}
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}

function BrandStat({
	iconName,
	name,
	stat,
}: {
	iconName: IconName
	name: string
	stat: number
}) {
	return (
		<Card className="text-center p-6">
			<p className="text-4xl mb-4">{stat}</p>
			<Icon name={iconName} size="lg">
				<span className="text-xl">{name}</span>
			</Icon>
		</Card>
	)
}
