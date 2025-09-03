type ModelUrlsReturnType<T extends boolean> = T extends true
	? {
			detailsUrl: (id: string, prdId: string) => string
			editUrl: (id: string, prdId: string) => string
			listUrl: (prdId: string) => string
			newUrl: (prdId: string) => string
		}
	: {
			detailsUrl: (id: string) => string
			editUrl: (id: string) => string
			listUrl: () => string
			newUrl: () => string
		}

export function getModelUrls<T extends boolean>(
	lowerPlural: string,
	inProject: T,
	isAdmin?: boolean,
): ModelUrlsReturnType<T> {
	const baseUrl = `${isAdmin ? 'admin/' : ''}${lowerPlural.replace(/\s+/g, '')}`
	return inProject
		? ({
				detailsUrl: (id: string, prdId: string) =>
					`/prds/${prdId}/${baseUrl}/${id}`,
				editUrl: (id: string, prdId: string) =>
					`/prds/${prdId}/${baseUrl}/${id}/edit`,
				listUrl: (prdId: string) => `/prds/${prdId}/${baseUrl}`,
				newUrl: (prdId: string) => `/prds/${prdId}/${baseUrl}/new`,
			} as ModelUrlsReturnType<T>)
		: ({
				detailsUrl: (id: string) => `/${baseUrl}/${id}`,
				editUrl: (id: string) => `/${baseUrl}/${id}/edit`,
				listUrl: () => `/${baseUrl}`,
				newUrl: () => `/${baseUrl}/new`,
			} as ModelUrlsReturnType<T>)
}
