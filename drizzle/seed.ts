import { invariant } from '@epic-web/invariant'
import { addBaseDataToNewTenant, createTenant } from '#app/models/tenant.server'
import { db } from '#app/utils/db.server'
import { post } from '#db/schema/index'
import { createUser, getUserImages, img } from '#tests/db-utils'
import { role, userToRole } from '../db/schema/role'
import { addUser } from './addUser'
import { blogSeed } from './seed/blog-seed'
import { allDemoData as defaultDemoData } from './seed/demo-data-default'
import { createDemoSeed } from './seed/demo-seed'
import { getAdminUser } from './seed/utils'

export async function seed({ minimal = false }: { minimal?: boolean } = {}) {
	console.log('🌱 Seeding...')
	console.time('🌱 Database has been seeded')

	// console.time('🧹 Cleaned up the database...')
	// // await cleanupDb()
	// console.timeEnd('🧹 Cleaned up the database...')

	const tenantId = await createTenant({
		completedOnboarding: false,
		hostname: 'localhost',
		name: 'demo',
		tier: 'pro',
	})
	console.time('🦾 Add tenant defaults...')

	console.timeEnd('🦾 Add tenant defaults...')

	if (minimal || process.env.MINIMAL_SEED) {
		console.log('👍 Minimal seed complete')
		console.timeEnd('🌱 Database has been seeded')
		return
	}

	const totalUsers = 5
	console.time(`👤 Created ${totalUsers} users...`)
	const userImages = await getUserImages()
	const regularUser = {
		email: 'michael@techinnovators.com',
		name: 'Michael',
		password: 'michaeldemouser',
		username: 'michael',
	}
	const users = [
		regularUser,
		...Array.from({ length: totalUsers }).map(() => {
			return createUser()
		}),
	]

	await Promise.all(
		users.map(async (userData, index) => {
			await addUser({
				internal: true,
				tenantId,
				userData,
				userImage: userImages[index % userImages.length],
			})
		}),
	)
	console.timeEnd(`👤 Created ${totalUsers} users...`)

	console.time(`🐨 Created admin user "daniel"`)
	const kodyImages = await img({
		filepath: './tests/fixtures/images/user/kody.png',
	})

	const superUserId = await addUser({
		internal: true,
		tenantId,
		userData: {
			email: 'daniel.arrizza@gmail.com',
			name: 'Daniel',
			password: 'dannyboy',
			username: 'daniel',
		},
		userImage: kodyImages,
	})

	const superAdminRoleId = (
		await db
			.insert(role)
			.values({ name: 'superadmin', tenantId })
			.returning({ id: role.id })
	)[0].id
	await db
		.insert(userToRole)
		.values({ roleId: superAdminRoleId, tenantId, userId: superUserId })

	console.timeEnd(`🐨 Created admin user "daniel"`)

	const tenantUser = await getAdminUser({ tenantId })
	if (!tenantUser) {
		throw new Error('User not found')
	}

	await addBaseDataToNewTenant(tenantUser)

	console.time('🐣 Seeded main demo')
	await createDemoSeed({ allDemoData: defaultDemoData, tenantUser })
	console.timeEnd('🐣 Seeded main demo')

	// typeface demo
	console.time('🌱 Created Typeface demo')
	const tenantIdTypeface = await createTenant({
		completedOnboarding: true,
		name: 'Typeface',
	})
	const typefaceAdminId = await addUser({
		internal: true,
		tenantId: tenantIdTypeface,
		userData: {
			email: 'mikey@typefaceexample.com',
			name: 'Mikey',
			password: 'mikeytypeface',
			username: 'mikey',
		},
		userImage: userImages[0],
	})

	const typefaceAdmin = await db.query.user.findFirst({
		where: { id: typefaceAdminId },
	})

	invariant(typefaceAdmin, 'Typeface admin not found')
	await addBaseDataToNewTenant(typefaceAdmin)
	// await addUser({
	// 	tenantId: tenantIdTypeface,
	// 	userData: {
	// 		email: 'johnny@techinnovators2.com',
	// 		name: 'Johnny',
	// 		password: 'johnnytypeface',
	// 		username: 'johnny',
	// 	},
	// 	userImage: userImages[0],
	// })
	// await createDemoSeed({ allDemoData: typefaceDemo, tenantUser: typefaceAdmin })
	console.timeEnd('🌱 Created Typeface demo')

	// seed blog
	await db.insert(post).values(blogSeed)

	console.timeEnd('🌱 Database has been seeded')
}
