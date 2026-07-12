import { PageBreadcrumbsWithLinks } from '@/components'
import { Collapse } from '@/components/FrostUI'
import { MenuLinks } from '@/constants/menu'
import { useAllPermissions } from '@/hooks/usePermission'
import { useState } from 'react'
import { PermissionTypes } from '@/constants/permissions'
import { useTranslation } from 'react-i18next'
import MenuCard from './MenuCard'

const AdministratorMenus = () => {
	const allPermissionsResults = useAllPermissions()
	const [cardAccordion, setCardAccordion] = useState<number | null>(-1)
	const { t } = useTranslation()
	const handleCardAccordion = (index: number) => () => {
		if (index === cardAccordion) setCardAccordion(null)
		else setCardAccordion(index)
	}

	const collapseMenuClass = (index: number) => `admin-menu-collapse ${cardAccordion === index ? 'overflow-visible' : 'overflow-hidden'}`

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Administration.Heading', 'Administrator')} subNames={[{ label: t('Manage.Administration.Subtitle', 'Administrator Options') }]} />

			<div className="pt-5">
				<div className="space-y-3">
					<div className="card">
						{(allPermissionsResults[PermissionTypes.Permissions_Roles_View] || allPermissionsResults[PermissionTypes.Permissions_Users_View]) && (
							<Collapse open={cardAccordion === 0} toggleCollapse={handleCardAccordion(0)}>
								<Collapse.Toggle className="admin-menu-button">
									{t('Manage.Administration.ParentHeading_UserManagement', 'User Management')}
									<span className="ri-arrow-down-s-line text-xl block transition-all"></span>
								</Collapse.Toggle>
								<Collapse.Menu className={collapseMenuClass(0)}>
									<div className="grid xl:grid-cols-4 lg:grid-cols-4 grid-cols-1 gap-6 mt-5 px-4">
										{allPermissionsResults[PermissionTypes.Permissions_Roles_View] && (
											<MenuCard to={MenuLinks.ManageRoles} icon="ri-shield-user-line" label={t('Manage.UserManagement.ManageRoles', 'Manage Roles')} />
										)}
										{allPermissionsResults[PermissionTypes.Permissions_Users_View] && (
											<MenuCard to={MenuLinks.ManageUsers} icon="ri-user-add-fill" label={t('Manage.UserManagement.ManageUsers', 'Manage Users')} />
										)}
									</div>
								</Collapse.Menu>
							</Collapse>
						)}
					</div>

					<div className="card">
						{(allPermissionsResults[PermissionTypes.Permissions_CountryLocalization_View] || allPermissionsResults[PermissionTypes.Permissions_ManageNexusLookUps_View] || allPermissionsResults[PermissionTypes.Permissions_Tenants_View]) && (
							<Collapse open={cardAccordion === 1} toggleCollapse={handleCardAccordion(1)}>
								<Collapse.Toggle className="admin-menu-button">
									{t('Manage.Administration.ParentHeading_NexusManagement', 'Nexus Management')}
									<span className="ri-arrow-down-s-line text-xl block transition-all"></span>
								</Collapse.Toggle>
								<Collapse.Menu className={collapseMenuClass(1)}>
									<div className="grid xl:grid-cols-3 lg:grid-cols-3 grid-cols-1 gap-5 mt-5 px-4">
										{allPermissionsResults[PermissionTypes.Permissions_CountryLocalization_View] && (
											<MenuCard to={MenuLinks.ManageLanguage} icon="ri-translate-2" label={t('Manage.NexusManagement.ManageLanguages', 'Manage Languages')} />
										)}
										{allPermissionsResults[PermissionTypes.Permissions_ManageNexusLookUps_View] && (
											<MenuCard to={MenuLinks.ManageNexusLookUps} icon="ri-database-2-line" label={t('Manage.NexusManagement.ManageNexusLookups')} />
										)}
										{allPermissionsResults[PermissionTypes.Permissions_Tenants_View] && (
											<MenuCard to={MenuLinks.ManageTenants} icon="ri-search-eye-line" label={t('Manage.NexusManagement.ManageTenants', 'Manage Tenants')} />
										)}
									</div>
								</Collapse.Menu>
							</Collapse>
						)}
					</div>

					<div className="card">
						{allPermissionsResults[PermissionTypes.Permissions_ManageLookUps_View] && (
							<Collapse open={cardAccordion === 2} toggleCollapse={handleCardAccordion(2)}>
								<Collapse.Toggle className="admin-menu-button">
									{t('Manage.Administration.ParentHeading_ListManagement', 'List Management')}
									<span className="ri-arrow-down-s-line text-xl block transition-all"></span>
								</Collapse.Toggle>
								<Collapse.Menu className={collapseMenuClass(2)}>
									<div className="grid xl:grid-cols-3 lg:grid-cols-3 grid-cols-1 gap-6 mt-5 px-4">
										{allPermissionsResults[PermissionTypes.Permissions_ManageLookUps_View] && (
											<MenuCard to={MenuLinks.ManageLookUps} icon="ri-building-4-line" label={t('Manage.ListManagement.ManageLookups', 'Manage Lookups')} />
										)}
									</div>
								</Collapse.Menu>
							</Collapse>
						)}
					</div>

					{allPermissionsResults[PermissionTypes.Permissions_ManageSettings_View] && (
						<div className="card">
							<MenuCard to={MenuLinks.ManageSettings} icon="ri-settings-3-line" label={t('Manage.Settings_Heading', 'Settings')} />
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default AdministratorMenus
