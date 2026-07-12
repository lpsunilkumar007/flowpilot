import { useEffect, useState } from 'react'
import { userService } from '@/services/UserService'
import type { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'

export function useUsers(reloadTrigger?: boolean) {
	const [users, setUsers] = useState<ViewUserDetailsResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchUsers = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await userService.getList()
			setUsers(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch users'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [reloadTrigger])

	return { users, loading, error, refetch: fetchUsers }
}
