import { PageBreadcrumbsWithLinks } from '@/components'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import withSuspense from '@/helpers/suspense.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const ViewSalesPipeline = withSuspense(lazy(() => import('./Components/ViewSalesPipeline')))

const ManageSalesPipeline: React.FC = () => {
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
	const navigate = useNavigate()
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageSalePipelines_Create)
	const [reloadKey, setReloadKey] = useState(0)

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.SalesPipeline_Heading', 'Sales Pipeline')} subNames={[{ label: t('Manage.Leads_Heading', 'Leads'), link: MenuLinks.ManageLeads }, { label: t('Manage.SalesPipeline_Breadcrumb', 'Pipeline') }]} />

			<PageWrapper>
				<PageTitle
					actions={
						<div className="flex flex-wrap items-center gap-2">
							<button type="button" className="btn bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700" onClick={() => setReloadKey((k) => k + 1)}>
								<i className="ri-refresh-line me-1" />
								{t('Common.Refresh', 'Refresh')}
							</button>
							{canCreate && (
								<button type="button" className="btn btn-primary inline-flex items-center gap-2 shadow-sm" onClick={() => navigate(MenuLinks.AddLead)}>
									<i className="ri-add-line" />
									{t('Manage.SalesPipeline.NewLead', 'New Lead')}
								</button>
							)}
						</div>
					}
				/>
				<PageBody className="min-w-0 overflow-hidden">
					<ViewSalesPipeline reloadKey={reloadKey} />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default ManageSalesPipeline
