import { jwtDecode } from "jwt-decode"


/**
 * API auth/session utilities.
 * API requests use the scoped httpClient (apiClients) - no global fetch override.
 */
const AUTH_SESSION_KEY = 'portal_user'

const getUserFromCookie = () => {
	const user = sessionStorage.getItem(AUTH_SESSION_KEY)
	return user ? JSON.parse(user) : null
}

class APICore {
	isUserAuthenticated = () => {
		const user = this.getLoggedInUser()

		if (!user) {
			return false
		}
		const decoded: any = jwtDecode(user.token)
		const currentTime = Date.now() / 1000
		if (decoded.exp < currentTime) {
			console.warn('access token expired')
			return false
		} else {
			return true
		}
	}

	setLoggedInUser = (session: any) => {
		if (session) sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
		else {
			sessionStorage.removeItem(AUTH_SESSION_KEY)
		}
	}
	/**
	 * Returns the logged in user
	 */
	getLoggedInUser = () => {
		return getUserFromCookie()
	}

	setUserInSession = (modifiedUser: any) => {
		const userInfo = sessionStorage.getItem(AUTH_SESSION_KEY)
		if (userInfo) {
			const { token, user } = JSON.parse(userInfo)
			this.setLoggedInUser({ token, ...user, ...modifiedUser })
		}
	}

	hasSessionExired = () => {
		const user = this.getLoggedInUser()
		if (!user) {
			return false
		}
		const decoded: any = jwtDecode(user.token)
		const currentTime = Date.now() / 1000
		if (decoded.exp < currentTime) {
			console.warn('access token expired')
			return true
		} else {
			return false
		}
	}
}

export { APICore }
