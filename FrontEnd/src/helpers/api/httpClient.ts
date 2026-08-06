/**
 * Scoped HTTP client for API requests.
 * - Injects Bearer token from session
 * - Handles 401/403/404 with toast
 */

import { toast } from 'react-toastify'

const AUTH_SESSION_KEY = 'portal_user'

const getToken = (): string => {
	const user = sessionStorage.getItem(AUTH_SESSION_KEY)

	if (!user) {
		return ''
	}

	try {
		const parsed = JSON.parse(user)
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
			toast.error(
				'Sorry! The data you are looking for could not be found'
			)
			break
	}

	return Promise.reject(errorData)
}

/**
 * Creates an authenticated fetch function for NSwag clients.
 */
export const createAuthenticatedFetch = (): ((
	url: RequestInfo | URL,
	init?: RequestInit
) => Promise<Response>) => {
	return async (
		url: RequestInfo | URL,
		init?: RequestInit
	): Promise<Response> => {
		const token = getToken()

		const modifiedInit: RequestInit = {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...(init?.headers || {}),
				...(token
					? { Authorization: `Bearer ${token}` }
					: {}),
			},
		}

		const response = await window.fetch(url, modifiedInit)

		if (response.ok) {
			return response
		}

		return handleErrorResponse(response)
	}
}

/** Singleton authenticated fetch for API clients */
export const authenticatedFetch = createAuthenticatedFetch()
