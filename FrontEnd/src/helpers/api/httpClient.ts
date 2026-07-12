/**
 * Scoped HTTP client for API requests.
 * Replaces the global fetch override with a dedicated client that:
 * - Injects Bearer token from session
 * - Maps LOCAL_API_URL to API_URL
 * - Handles 401/403/404 with toast (no global loading, no button disabling)
 */

import config from '../../config'
import { toast } from 'react-toastify'

const AUTH_SESSION_KEY = 'portal_user'

const getToken = (): string => {
	const user = sessionStorage.getItem(AUTH_SESSION_KEY)
	if (!user) return ''
	try {
		const parsed = typeof user === 'object' ? user : JSON.parse(user)
		return parsed?.token ?? ''
	} catch {
		return ''
	}
}

const handleErrorResponse = async (response: Response): Promise<never> => {
	let errorData: unknown
	try {
		errorData = await response.clone().json()
	} catch {
		errorData = await response.text()
	}

	switch (response.status) {
		case 401:
			toast.error('Invalid credentials or session expired')
			break
		case 403:
			window.location.href = '/access-denied'
			break
		case 404:
			toast.error('Sorry! The data you are looking for could not be found')
			break
		default:
			// Other errors - let caller handle via messageHelper in catch
			break
	}

	return Promise.reject(errorData)
}

/**
 * Creates an authenticated fetch function for use with NSwag clients.
 * Only applies to requests - no global loading or button disabling.
 */
export const createAuthenticatedFetch = (): ((url: RequestInfo, init?: RequestInit) => Promise<Response>) => {
	const apiUrl = config.API_URL ?? ''
	const localApiUrl = config.LOCAL_API_URL ?? ''

	return async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
		const token = getToken()
		const urlString = typeof url === 'string' ? url : url.toString()
		const modifiedUrl = localApiUrl ? urlString.replace(localApiUrl, apiUrl) : urlString

		const modifiedInit: RequestInit = {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...(init?.headers || {}),
				Authorization: token ? `Bearer ${token}` : '',
			},
		}

		const response = await window.fetch(modifiedUrl, modifiedInit)

		if (response.ok) {
			return response
		}

		return handleErrorResponse(response)
	}
}

/** Singleton authenticated fetch for API clients */
export const authenticatedFetch = createAuthenticatedFetch()
