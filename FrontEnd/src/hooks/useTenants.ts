import { useEffect, useState } from 'react'
import { multiTenantService } from '@/services/MultiTenantService'
import type { PaginationResponseOfViewTenantResponse, SearchTenantRequest } from '@/helpers/api/WebApiClient'

export function useTenants(request: SearchTenantRequest, reloadTrigger?: boolean) {
	const [data, setData] = useState<PaginationResponseOfViewTenantResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchTenants = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await multiTenantService.getTenant(request)
			setData(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch tenants'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchTenants()
	}, [reloadTrigger, JSON.stringify(request)])

	return { data, loading, error, refetch: fetchTenants }
}
