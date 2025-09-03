import type { LoaderFunctionArgs } from 'react-router'
import { db } from '#app/utils/db.server'
import { invariantResponse } from '#app/utils/misc'

export async function loader({ params }: LoaderFunctionArgs) {
	invariantResponse(params.imageId, 'Image ID is required', { status: 400 })
	const image = await db.query.userImage.findFirst({
		columns: {
			blob: true,
			contentType: true,
		},
		where: { id: params.imageId },
	})

	invariantResponse(image, 'Not found', { status: 404 })

	const buffer = Buffer.from(image.blob, 'base64')
	return new Response(buffer, {
		headers: {
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Content-Disposition': `inline; filename="${params.imageId}"`,
			'Content-Length': Buffer.byteLength(buffer).toString(),
			'Content-Type': image.contentType,
		},
	})
}
