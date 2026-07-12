import { useEffect, useState } from 'react'
import { emailTemplateService } from '@/services/EmailTemplateService'
import type { PaginationResponseOfViewEmailTemplateResponse, SearchEmailTemplateRequest } from '@/helpers/api/WebApiClient'

export function useEmailTemplates(request: SearchEmailTemplateRequest, reloadTrigger?: boolean) {
	const [data, setData] = useState<PaginationResponseOfViewEmailTemplateResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchEmailTemplates = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await emailTemplateService.getEmailTemplates(request)
			setData(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch email templates'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchEmailTemplates()
	}, [reloadTrigger, JSON.stringify(request)])

	return { data, loading, error, refetch: fetchEmailTemplates }
}
