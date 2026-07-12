import { useEffect, useState } from 'react'
import { emailLogService } from '@/services/EmailLogService'
import type { PaginationResponseOfViewEmailLogResponse, SearchEmailLogRequest } from '@/helpers/api/WebApiClient'

export function useEmailLogs(request: SearchEmailLogRequest, reloadTrigger?: boolean) {
	const [data, setData] = useState<PaginationResponseOfViewEmailLogResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchEmailLogs = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await emailLogService.getEmailLogList(request)
			setData(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch email logs'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchEmailLogs()
	}, [reloadTrigger, JSON.stringify(request)])

	return { data, loading, error, refetch: fetchEmailLogs }
}
