import { Route, Navigate, useLocation } from 'react-router-dom'

// helpers
import { APICore } from '../helpers/api/apiCore'

export interface PrivateRouteProps {
	component: React.ComponentType<{ location?: ReturnType<typeof useLocation> }>
	roles?: string[]
	path?: string
	element?: React.ReactNode
}

/**
 * Private Route forces the authorization before the route can be accessed
 */
const PrivateRoute = ({ component: Component, roles, ...rest }: PrivateRouteProps) => {
	const api = new APICore()

	const loggedInUser = api.getLoggedInUser() as { role?: string } | null

	if (api.isUserAuthenticated() === false) {
		return (
			<Route
				{...rest}
				element={
					<Navigate
						to={{
							pathname: '/auth/login',
						}}
					/>
				}
			/>
		)
	}

	if (roles && loggedInUser && roles.indexOf(loggedInUser.role ?? '') === -1) {
		return (
			<Route
				{...rest}
				element={<Navigate to={{ pathname: '/' }} />}
			/>
		)
	}

	return (
		<Route
			{...rest}
			element={<Component />}
		/>
	)
}

export default PrivateRoute
