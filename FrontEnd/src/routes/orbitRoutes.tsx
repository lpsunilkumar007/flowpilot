import React from 'react'
import PrivateRoute from './PrivateRoute'
import { MenuLinks } from '@/constants/menu'
import type { RoutesProps } from './utils'

// Static imports (orbit)
import ManageNexusLookUps from '@/pages/orbit/manage-nexus-lookups'
import ApprovedAppointmentSettings from '@/pages/orbit/manage-settings/Components/ApprovedAppointmentSettings'

// Lazy imports (orbit - auth-protected only)
const ManageUsers = React.lazy(() => import('@/pages/orbit/manage-users'))
const ManageRoles = React.lazy(() => import('@/pages/orbit/manage-roles'))
const ManageProfile = React.lazy(() => import('@/pages/orbit/manage-profile'))
const ManageLookUps = React.lazy(() => import('@/pages/orbit/manage-lookups'))
const ManageLookUpCodeValues = React.lazy(() => import('@/pages/orbit/manage-lookup-values'))
const ManageNexusLookUpsValues = React.lazy(() => import('@/pages/orbit/manage-nexus-lookup-values'))
const ManageEmailLog = React.lazy(() => import('@/pages/orbit/manage-email-log'))
const ManageSettings = React.lazy(() => import('@/pages/orbit/manage-settings'))
const ManageAppointmentSettings = React.lazy(() => import('@/pages/orbit/manage-settings/Components/AppointmentSettings'))
const ManageAppointment = React.lazy(() => import('@/pages/orbit/manage-appointments'))
const ManageEmailTemplate = React.lazy(() => import('@/pages/orbit/manage-email-templates'))
const EditTenant = React.lazy(() => import('@/pages/orbit/manage-tenants/Components/EditTenantLandingPage'))
const ManageTenants = React.lazy(() => import('@/pages/orbit/manage-tenants'))
const MySubscriptions = React.lazy(() => import('@/pages/orbit/my-subscriptions'))
const ManageForms = React.lazy(() => import('@/pages/orbit/manage-forms'))
const AddManageForm = React.lazy(() => import('@/pages/orbit/manage-forms/Components/AddFormDetails'))
const EditFormLandingPage = React.lazy(() => import('@/pages/orbit/manage-forms/Components/EditFormLandingPage'))
const ManageLeads = React.lazy(() => import('@/pages/orbit/manage-leads'))
const AddLead = React.lazy(() => import('@/pages/orbit/manage-leads/Components/AddLeadDetails'))
const EditLeadLandingPage = React.lazy(() => import('@/pages/orbit/manage-leads/Components/EditLeadLandingPage'))
const ManageLanguage = React.lazy(() => import('@/pages/orbit/manage-language'))
const ManageLanguageLocalizations = React.lazy(() => import('@/pages/orbit/manage-language/Components/ViewLocalizationPage'))
const ViewSubMenus = React.lazy(() => import('@/pages/orbit/view-sub-menus'))

const orbitAdministratorRoutes: RoutesProps = {
	path: '/administrator',
	name: 'Administrator',
	icon: 'home',
	header: 'Navigation',
	children: [
		{
			path: MenuLinks.ManageUsers,
			name: 'manage_users',
			element: <ManageUsers />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageRoles,
			name: 'manage_roles',
			element: <ManageRoles />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageLookUps,
			name: 'manage_lookups',
			element: <ManageLookUps />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageLookUpValues,
			name: 'manage_lookups',
			element: <ManageLookUpCodeValues />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageNexusLookUps,
			name: 'manage_nexus_lookups',
			element: <ManageNexusLookUps />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageNexusLookUpValues,
			name: 'manage_nexus_look_ups',
			element: <ManageNexusLookUpsValues />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageEmailLog,
			name: 'manage_emaillog',
			element: <ManageEmailLog />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageSettings,
			name: 'manage_settings',
			element: <ManageSettings />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageAppointmentSettings,
			name: 'manage_appointment_settings',
			element: <ManageAppointmentSettings />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageAppointment,
			name: 'manage_appointments',
			element: <ManageAppointment />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageEmailTemplate,
			name: 'manage_emailTemplates',
			element: <ManageEmailTemplate />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ApprovedAppointmentSettings,
			name: 'approved_appointment_settings',
			element: <ApprovedAppointmentSettings />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageLanguage,
			name: 'manage_countryLocalization',
			element: <ManageLanguage />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageLanguageLocalizations,
			name: 'manage_countryLocalization',
			element: <ManageLanguageLocalizations />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageTenants,
			name: 'manage_tenants',
			element: <ManageTenants />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ViewSubMenus,
			name: 'view_sub_menus',
			element: <ViewSubMenus />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.EditTenantDetails,
			name: 'edit_tenant_details',
			element: <EditTenant />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.MySubscriptions,
			name: 'my_subscriptions',
			element: <MySubscriptions />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.ManageForms,
			name: 'manage_forms',
			element: <ManageForms />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.AddManageForm,
			name: 'add_manage_form',
			element: <AddManageForm />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.EditFormLandingPage,
			name: 'Edit_manage_form',
			element: <EditFormLandingPage />,
			route: PrivateRoute,
		},
	],
}

const orbitCrmRoutes: RoutesProps = {
	path: '/',
	name: 'CRM',
	children: [
		{
			path: MenuLinks.ManageLeads,
			name: 'manage_leads',
			element: <ManageLeads />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.AddLead,
			name: 'add_lead',
			element: <AddLead />,
			route: PrivateRoute,
		},
		{
			path: MenuLinks.EditLead,
			name: 'edit_lead',
			element: <EditLeadLandingPage />,
			route: PrivateRoute,
		},
	],
}

const orbitTopMenuRoutes: RoutesProps = {
	path: '/topmenu',
	name: 'TopMenu',
	icon: 'home',
	header: 'Navigation',
	children: [
		{
			path: MenuLinks.ManageProfile,
			name: 'manage_profile',
			element: <ManageProfile />,
			route: PrivateRoute,
		},
	],
}

export const orbitRoutes: RoutesProps[] = [orbitAdministratorRoutes, orbitCrmRoutes, orbitTopMenuRoutes]
