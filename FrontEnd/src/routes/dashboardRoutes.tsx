import { MenuLinks } from '@/constants/menu'
import Dashboard from '@/pages/dashboard'
import { Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import type { RoutesProps } from './utils'

export const dashboardRoutes: RoutesProps = {
	path: MenuLinks.Dashboard,
	name: 'Dashboards',
	icon: 'home',
	header: 'Navigation',
	element: <Dashboard />,
	route: PrivateRoute,
	children: [
		{
			path: '/',
			name: 'Root',
			element: <Navigate to={MenuLinks.Dashboard} />,
			route: PrivateRoute,
		},
	],
}
