import { useEffect, useState } from 'react'
import { roleService } from '@/services/RoleService'
import type { RoleDto } from '@/helpers/api/WebApiClient'

export function useRoles(reloadTrigger?: boolean) {
	const [roles, setRoles] = useState<RoleDto[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchRoles = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await roleService.getList()
			setRoles(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch roles'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchRoles()
	}, [reloadTrigger])

	return { roles, loading, error, refetch: fetchRoles }
}
