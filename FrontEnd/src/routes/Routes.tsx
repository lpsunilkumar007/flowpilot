import React from 'react'
import { Navigate, Route, RouteProps, Routes } from 'react-router-dom'

// redux
import { RootState } from '../redux/store'
import { useSelector } from 'react-redux'

// All layouts containers
import DefaultLayout from '../layouts/Default'
import VerticalLayout from '../layouts/Vertical'
import ErrorBoundary from '../components/ErrorBoundary'

import { authProtectedFlattenRoutes, publicProtectedFlattenRoutes } from '.'
import { APICore } from '../helpers/api/apiCore'

const AllRoutes = (props: RouteProps) => {
	const Layout = useSelector((state: RootState) => state.Layout)

	const api = new APICore()

	return (
		<React.Fragment>
			<Routes>
				<Route>
					{publicProtectedFlattenRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								<ErrorBoundary>
									<DefaultLayout {...props} layout={Layout}>
										{route.element}
									</DefaultLayout>
								</ErrorBoundary>
							}
							key={idx}
						/>
					))}
					;
				</Route>

				<Route>
					{authProtectedFlattenRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								api.isUserAuthenticated() === false ? (
									<Navigate
										to={{
											pathname: !api.hasSessionExired() ? '/auth/login' : '/auth/logout',
											search: `next=${route.path}${!api.hasSessionExired() ? '' : '&type=unauthorized'}`,
										}}
									/>
								) : (
									<ErrorBoundary>
										<VerticalLayout {...props}>{route.element}</VerticalLayout>
									</ErrorBoundary>
								)
							}
							key={idx}
						/>
					))}
					;
				</Route>
			</Routes>
		</React.Fragment>
	)
}

export default AllRoutes
