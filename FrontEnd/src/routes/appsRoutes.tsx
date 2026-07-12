import React from 'react'
import PrivateRoute from './PrivateRoute'
import type { RoutesProps } from './utils'

const ChatApp = React.lazy(() => import('../pages/apps/Chat/'))
const EmailInbox = React.lazy(() => import('../pages/apps/Email/Inbox'))
const EmailRead = React.lazy(() => import('../pages/apps/Email/Read'))
const TasksList = React.lazy(() => import('../pages/apps/Tasks/TasksList/'))
const TasksDetails = React.lazy(() => import('../pages/apps/Tasks/TasksDetails/'))
const KanbanApp = React.lazy(() => import('../pages/apps/Kanban/'))
const FileManagerApp = React.lazy(() => import('../pages/apps/FileManager/'))

const chatAppRoutes: RoutesProps = {
	path: '/apps/chat',
	name: 'Chat',
	route: PrivateRoute,
	roles: ['Admin'],
	icon: 'chat',
	element: <ChatApp />,
	header: 'Apps',
}

const emailAppRoutes: RoutesProps = {
	path: '/apps/email',
	name: 'Email',
	route: PrivateRoute,
	roles: ['Admin'],
	icon: 'email',
	children: [
		{
			path: '/apps/email/inbox',
			name: 'Inbox',
			element: <EmailInbox />,
			route: PrivateRoute,
		},
		{
			path: '/apps/email/read',
			name: 'Read Email',
			element: <EmailRead />,
			route: PrivateRoute,
		},
	],
}

const tasksAppRoutes: RoutesProps = {
	path: '/apps/tasks',
	name: 'Tasks',
	route: PrivateRoute,
	roles: ['Admin'],
	icon: 'task',
	children: [
		{
			path: '/apps/tasks/list',
			name: 'List',
			element: <TasksList />,
			route: PrivateRoute,
		},
		{
			path: '/apps/tasks/details',
			name: 'Details',
			element: <TasksDetails />,
			route: PrivateRoute,
		},
	],
}

const kanbanAppRoutes: RoutesProps = {
	path: '/apps/kanban',
	name: 'Kanban Board',
	route: PrivateRoute,
	roles: ['Admin'],
	icon: 'kanban',
	element: <KanbanApp />,
	header: 'Apps',
}

const fileAppRoutes: RoutesProps = {
	path: '/apps/file-manager',
	name: 'File Manager',
	route: PrivateRoute,
	roles: ['Admin'],
	icon: 'filemanager',
	element: <FileManagerApp />,
	header: 'Apps',
}

export const appsRoutes: RoutesProps[] = [chatAppRoutes, emailAppRoutes, tasksAppRoutes, kanbanAppRoutes, fileAppRoutes]
