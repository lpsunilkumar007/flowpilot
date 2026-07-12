import PageBreadcrumbsWithLinks from '@/components/PageBreadcrumbsWithLinks'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const ViewLeads = React.lazy(() => import('./Components/ViewLeads'))

const ManageLeads: React.FC = () => {
	const { userHasPermission } = usePermission()
	const navigate = useNavigate()
	const { t } = useTranslation()
	const [reloadLeads, setReloadLeads] = useState(false)

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Leads_Heading', 'Leads')} subNames={[{ label: t('Manage.Leads.Breadcrumb', 'Leads') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_ManageLeads_Create) && (
					<PageTitle
						actions={
							<button onClick={() => navigate(MenuLinks.AddLead)} className="btn btn-primary inline-flex items-center gap-2 shadow-sm">
								<i className="ri-add-line" />
								{t('Manage.Leads.Action_Add', 'Create Lead')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewLeads reloadLeads={reloadLeads} onReload={() => setReloadLeads((v) => !v)} />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default ManageLeads
