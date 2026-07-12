import { PageBreadcrumbsWithLinks } from '@/components'
import { usePermission } from '@/hooks/usePermission'
import { lazy } from 'react'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MenuLinks } from '@/constants/menu'
import { PageBody, PageWrapper } from '@/components/PageWrapper'

const ViewTenants = withSuspense(lazy(() => import('./Components/ViewTenants')))

const ManageTenants = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const onActionClick = async (id: string, action: string) => {
		if (action === 'Edit') {
			navigate(MenuLinks.EditTenantDetails.replace(':id', String(id)))
		}
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Tenants_Heading', 'Tenants')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Tenants.Breadcrumb', 'Tenants') }]} />

			<PageWrapper>
				<PageBody>
					<ViewTenants onActionClick={onActionClick} />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default ManageTenants
