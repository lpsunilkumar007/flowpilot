import { useEffect, useState } from 'react'
import { settingsService } from '@/services/SettingsService'
import type { ViewSettingResponse } from '@/helpers/api/WebApiClient'

export function useSettings(reloadTrigger?: boolean) {
	const [settings, setSettings] = useState<ViewSettingResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchSettings = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await settingsService.getSettings()
			setSettings(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch settings'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchSettings()
	}, [reloadTrigger])

	return { settings, loading, error, refetch: fetchSettings }
}
