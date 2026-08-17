import { useAllPermissions } from '@/hooks/usePermission'
import { PermissionTypes } from './permissions'

export interface MenuItemTypes {
	key: string
	label: string
	isTitle?: boolean
	icon?: string
	url?: string
	badge?: {
		variant: string
		text: string
	}
	parentKey?: string
	target?: string
	children?: MenuItemTypes[]
}

export enum MenuLinks {
	Login = '/auth/login',
	RecoverPassword = '/auth/recover-password',
	ManageUsers = '/administrator/manage-users',
	ManageRoles = '/administrator/manage-roles',
	ManageProfile = '/user/manage-profile',
	ManageLookUps = '/administrator/manage-lookups',
	ManageLookUpValues = '/administrator/manage-lookup-values/:id/:lookupCodeId',
	ManageEmailLog = '/administrator/manage-email-log',
	Register = '/auth/register',
	RegisterSuccess = '/auth/register-success',
	ConfirmMail = '/auth/confirm-mail/:code/:userId',
	ManageNexusLookUps = '/administrator/manage-nexus-lookups',
	ManageNexusLookUpValues = '/administrator/manage-nexus-lookup-values/:id/:lookupCodeId',
	ViewAdministratorSubMenu = '/sub/administrator',
	ManageSettings = '/administrator/manage-settings',
	ManageAppointmentSettings = '/administrator/manage-appointment-settings/:id',
	ApprovedAppointmentSettings = '/administrator/approved-appointment-settings/:id',
	GoogleMapSettings = '/administrator/google-map-settings/:id',
	ManageAppointment = '/administrator/manage-appointments',
	AppointmentConfirmationUrl = '/appointment/confirm/:id',
	ManageEmailTemplate = '/administrator/manage-email-template',
	StartMeetingUrl = '/appointment/start-meeting/:u',
	ManageLanguage = '/administrator/manage-language',
	ManageLanguageLocalizations = '/administrator/manage-language/localizations/:countryId',
	ViewSubMenus = '/sub/:subType',
	BuySubscriptionPlan = '/subscription-plan',
	SubscriptionStatus = '/subscription-status',
	PaymentConfirmation = '/payment-confirmation',
	ManageTenants = '/administrator/manage-tenants',
	EditTenantDetails = '/administrator/manage-tenants/edit/:id',
	MySubscriptions = '/my-subscriptions',
	ManageForms = '/manage-form',
	AddManageForm = '/manage-form/add',
	EditFormLandingPage = '/manage-form/edit/:id',
	TwoFactorVerification = '/auth/two-factor-verification/:sessionId',
	Dashboard = '/dashboard',
	ManageOfferings = '/manage-offerings',
	ManageLeads = '/manage-leads',
	LeadCalendar = '/manage-leads/calendar',
	AddLead = '/manage-leads/create',
	ImportLeads = '/manage-leads/import',
	EditLead = '/manage-leads/:id',
	ManageTasks = '/manage-tasks',
	SalesPipeline = '/manage-leads/pipeline',
	MyTeam = '/my-team',
}

const MENU_ITEMS: MenuItemTypes[] = [
	//{
	//	key: 'manage_appointments',
	//	label: 'Manage.Appointments_Heading',
	//	isTitle: false,
	//	icon: 'ri-calendar-event-line',
	//	url: MenuLinks.ManageAppointment,
	//},
	//{
	//	key: 'manage_forms',
	//	label: 'Manage.Forms_Heading',
	//	isTitle: false,
	//	icon: 'ri-survey-line',
	//	url: MenuLinks.ManageForms,
	//},
	{
		key: 'sales_crm',
		label: 'Manage.SalesCrm_Nav_Heading',
		isTitle: true,
	},
	{
		key: 'manage_offerings',
		label: 'Manage.Offerings_Heading',
		isTitle: false,
		icon: 'ri-shopping-bag-3-line',
		url: MenuLinks.ManageOfferings,
	},
	{
		key: 'lead_calendar',
		label: 'Manage.Leads.Calendar_Heading',
		isTitle: false,
		icon: 'ri-calendar-check-line',
		url: MenuLinks.LeadCalendar,
	},
	{
		key: 'manage_leads',
		label: 'Manage.Leads_Heading',
		isTitle: false,
		icon: 'ri-user-star-line',
		url: MenuLinks.ManageLeads,
	},
	{
		key: 'manage_tasks',
		label: 'Manage.Tasks_Heading',
		isTitle: false,
		icon: 'ri-task-line',
		url: MenuLinks.ManageTasks,
	},
	{
		key: 'sales_pipeline',
		label: 'Manage.SalesPipeline_Heading',
		isTitle: false,
		icon: 'ri-funds-line',
		url: MenuLinks.SalesPipeline,
	},
	{
		key: 'my_team',
		label: 'Manage.MyTeam_Heading',
		isTitle: false,
		icon: 'ri-team-line',
		url: MenuLinks.MyTeam,
	},
	{
		key: 'manage_email_nav',
		label: 'Manage.Email_Nav_Heading',
		isTitle: true,
	},
	{
		key: 'manage_email_log',
		label: 'Manage.EmailLog_Heading',
		isTitle: false,
		icon: 'ri-mail-send-line',
		url: MenuLinks.ManageEmailLog,
	},
	{
		key: 'manage_emailTemplates',
		label: 'Manage.EmailTemplates_Heading',
		isTitle: false,
		icon: 'ri-mail-send-line',
		url: MenuLinks.ManageEmailTemplate,
	},

	{
		key: 'administrator_nav',
		label: 'Manage.Admin_Nav_Heading',
		isTitle: true,
	},
	{
		key: 'administrator',
		label: 'Manage.Administrator_Heading',
		isTitle: false,
		icon: 'ri-admin-line',
		url: MenuLinks.ViewAdministratorSubMenu,
	},
]

const getMenuItems = () => {
	// NOTE - You can fetch from server and return here as well

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const allPermissions = useAllPermissions() // Get all permissions

	// Define a mapping of item keys to the required permissions
	const permissionMapping: Record<string, PermissionTypes[]> = {
		sales_crm: [
			PermissionTypes.Permissions_ManageOfferings_View,
			PermissionTypes.Permissions_ManageLeads_View,
			PermissionTypes.Permissions_ManageLeadCalendar_View,
			PermissionTypes.Permissions_ManageTasks_View,
			PermissionTypes.Permissions_ManageSalePipelines_View,
		],
		manage_offerings: [PermissionTypes.Permissions_ManageOfferings_View],
		lead_calendar: [PermissionTypes.Permissions_ManageLeadCalendar_View],
		manage_leads: [PermissionTypes.Permissions_ManageLeads_View],
		manage_tasks: [PermissionTypes.Permissions_ManageTasks_View],
		sales_pipeline: [PermissionTypes.Permissions_ManageSalePipelines_View],
		my_team: [PermissionTypes.Permissions_ManageLeads_View, PermissionTypes.Permissions_ManageTasks_View],
		manage_email_nav: [PermissionTypes.Permissions_EmailLog_View, PermissionTypes.Permissions_EmailTemplates_View],
		manage_email_log: [PermissionTypes.Permissions_EmailLog_View],
		manage_emailTemplates: [PermissionTypes.Permissions_EmailTemplates_View],
		administrator_nav: [
			PermissionTypes.Permissions_Users_View,
			PermissionTypes.Permissions_Roles_View,
			PermissionTypes.Permissions_ManageLookUps_View,
			PermissionTypes.Permissions_CountryLocalization_View,
			PermissionTypes.Permissions_ManageNexusLookUps_View,
			PermissionTypes.Permissions_ManageSettings_View,
			PermissionTypes.Permissions_Tenants_View,
		],
		administrator: [
			PermissionTypes.Permissions_Users_View,
			PermissionTypes.Permissions_Roles_View,
			PermissionTypes.Permissions_ManageLookUps_View,
			PermissionTypes.Permissions_CountryLocalization_View,
			PermissionTypes.Permissions_ManageNexusLookUps_View,
			PermissionTypes.Permissions_ManageSettings_View,
			PermissionTypes.Permissions_Tenants_View,
		],

		//manage_forms: [PermissionTypes.Permissions_ManageForm_View],
		//manage_appointments: [PermissionTypes.Permissions_ManageAppointments_View, PermissionTypes.Permissions_ManageSettings_View],
	}

	const menuWithPermissions = MENU_ITEMS.map((item) => {
		// Define the logic for when the menu item can be displayed
		let canDisplay = true

		// Check if the current item has mapped permissions
		if (permissionMapping[item.key]) {
			// Ensure all required permissions are true
			if (item.key === 'manage_appointments') {
				canDisplay = permissionMapping[item.key].every((permission) => allPermissions[permission])
			} else {
				canDisplay = permissionMapping[item.key].some((permission) => allPermissions[permission])
			}
		}

		// Return the modified menu item with canDisplay property
		return {
			...item,
			canDisplay,
		}
	})

	return menuWithPermissions.filter((x) => x.canDisplay)
}

const findAllParent = (menuItems: MenuItemTypes[], menuItem: MenuItemTypes): string[] => {
	let parents: string[] = []
	const parent = findMenuItem(menuItems, menuItem.parentKey)

	if (parent) {
		parents.push(parent.key)
		if (parent.parentKey) {
			parents = [...parents, ...findAllParent(menuItems, parent)]
		}
	}
	return parents
}

const findMenuItem = (menuItems: MenuItemTypes[] | undefined, menuItemKey: MenuItemTypes['key'] | undefined): MenuItemTypes | null => {
	if (menuItems && menuItemKey) {
		for (let i = 0; i < menuItems.length; i++) {
			if (menuItems[i].key === menuItemKey) {
				return menuItems[i]
			}
			const found = findMenuItem(menuItems[i].children, menuItemKey)
			if (found) return found
		}
	}
	return null
}

export { findAllParent, findMenuItem, getMenuItems }

export { MENU_ITEMS }
