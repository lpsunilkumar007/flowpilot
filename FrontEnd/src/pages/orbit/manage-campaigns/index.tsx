import { PageBreadcrumbsWithLinks } from '@/components'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import withSuspense from '@/helpers/suspense.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const ViewCampaigns = withSuspense(lazy(() => import('./Components/ViewCampaigns')))

const ManageCampaigns: React.FC = () => {
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
	const navigate = useNavigate()
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageCampaigns_Create)

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Campaigns_Heading', 'Campaigns')} subNames={[{ label: t('Manage.Campaigns.Breadcrumb', 'Campaigns') }]} />

			<PageWrapper>
				{canCreate && (
					<PageTitle
						actions={
							<button type="button" onClick={() => navigate(MenuLinks.CreateCampaign)} className="btn btn-primary inline-flex items-center gap-2 shadow-sm">
								<i className="ri-add-line" />
								{t('Manage.Campaigns.Action_Add', 'Create Campaign')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewCampaigns />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default ManageCampaigns
