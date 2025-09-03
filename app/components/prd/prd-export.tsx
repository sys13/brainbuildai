import jsPDF from 'jspdf'
import { useState } from 'react'
import type {
	ContextFileClient,
	DesignImageClient,
	DesignLinkClient,
	ExistingAndSuggestedClient,
	ExistingClient,
	ExistingUserInterviewProps,
} from '#app/utils/sort-objs'
import { ExportOptions } from '../export-options'
export interface Prd {
	name: string
	goal?: { description: string }
	problems?: { description: string }[]
	features?: { title: string }[]
	stories?: { description: string }[]
	success_criteria?: { description: string }[]
}

export interface PrdPersonaProps {
	id: string
	personaId: string
}
export interface PersonasProps {
	personas: ExistingAndSuggestedClient[]
	prdPersonas: PrdPersonaProps[]
}

type PRD = {
	summary: ExistingClient
	context: {
		context: ExistingClient
		files: ContextFileClient[]
	}
	personas: PersonasProps
	goals: ExistingAndSuggestedClient[]
	stories: ExistingAndSuggestedClient[]
	risks: ExistingAndSuggestedClient[]
	problems: ExistingAndSuggestedClient[]
	success_criteria: ExistingAndSuggestedClient[]
	features: ExistingAndSuggestedClient[]
	userInterviews: ExistingUserInterviewProps
	designs: {
		links: DesignLinkClient[]
		images: DesignImageClient[]
	}
}
export function PrdExport({
	prdId,
	name,
	data,
}: {
	prdId: string
	name: string
	data: {
		summary: Promise<ExistingClient>
		context: Promise<{
			context: ExistingClient
			files: ContextFileClient[]
		}>
		personas: Promise<PersonasProps>
		goals: Promise<ExistingAndSuggestedClient[]>
		stories: Promise<ExistingAndSuggestedClient[]>
		risks: Promise<ExistingAndSuggestedClient[]>
		problems: Promise<ExistingAndSuggestedClient[]>
		success_criteria: Promise<ExistingAndSuggestedClient[]>
		features: Promise<ExistingAndSuggestedClient[]>
		userInterviews: Promise<ExistingUserInterviewProps>
		designs: Promise<{
			links: DesignLinkClient[]
			images: DesignImageClient[]
		}>
	}
}) {
	const [isLoading, setIsLoading] = useState(false)

	const loadData = async (): Promise<PRD> => {
		const [
			summary,
			context,
			personas,
			goals,
			stories,
			risks,
			problems,
			success_criteria,
			features,
			userInterviews,
			designs,
		] = await Promise.all([
			data.summary,
			data.context,
			data.personas,
			data.goals,
			data.stories,
			data.risks,
			data.problems,
			data.success_criteria,
			data.features,
			data.userInterviews,
			data.designs,
		])
		return {
			summary,
			context,
			personas,
			goals,
			stories,
			risks,
			problems,
			success_criteria,
			features,
			userInterviews,
			designs,
		}
	}

	const formatAsMarkdown = (prd: PRD) => {
		return `# PRD Export\n\n${Object.entries(prd)
			.map(([key, value]) => {
				if (!value || (Array.isArray(value) && value.length === 0)) return ''

				const title = key
					.replaceAll('_', ' ')
					.replace(/\b\w/g, (c) => c.toUpperCase())

				if (Array.isArray(value)) {
					return `## ${title}\n${value.map((v) => `- ${v.name}`).join('\n')}\n`
				}

				if (typeof value === 'object') {
					// @ts-expect-error
					return `## ${title}\n${value.description || value.name || JSON.stringify(value)}\n`
				}

				return `## ${title}\n${value}\n`
			})
			.join('\n')}`
	}

	const handleExport = async (type: 'pdf' | 'markdown' | 'json') => {
		setIsLoading(true)
		const prd = await loadData()
		setIsLoading(false)

		const fileName = name
			.trim()
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')

		if (type === 'json') {
			const blob = new Blob([JSON.stringify(prd, null, 2)], {
				type: 'application/json',
			})
			const url = URL.createObjectURL(blob)
			triggerDownload(url, `${fileName}.json`)
		} else if (type === 'markdown') {
			const md = formatAsMarkdown(prd)
			const blob = new Blob([md], { type: 'text/markdown' })
			const url = URL.createObjectURL(blob)
			triggerDownload(url, `${fileName}.md`)
		} else if (type === 'pdf') {
			const md = formatAsMarkdown(prd)
			const doc = new jsPDF()
			const lines = doc.splitTextToSize(md, 180)
			doc.text(lines, 10, 10)
			doc.save(`${fileName}.pdf`)
		}
	}

	function triggerDownload(url: string, filename: string) {
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	return (
		<div>
			<ExportOptions isLoading={isLoading} onExport={handleExport} />
		</div>
	)
}
