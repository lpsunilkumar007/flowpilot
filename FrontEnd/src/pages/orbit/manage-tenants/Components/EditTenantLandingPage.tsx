import { EmptyState, PageBreadcrumbsWithLinks } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { Tab } from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import withSuspense from '@/helpers/suspense.helper'
import { lazy } from 'react'

const ViewTenantSubscriptions = withSuspense(lazy(() => import('./ViewTenantSubscriptions')))
const ViewTenantUsers = withSuspense(lazy(() => import('./ViewTenantUsers')))
const EditTenantDetails = withSuspense(lazy(() => import('./EditTenantDetails')))

type RouteParams = {
	id: string
}
const EditTenant = () => {
	const { id } = useParams<RouteParams>()
	const { t } = useTranslation()

	const tabContents = [
		{
			title: t('Manage.Tenants.Edit.Tab_TenantDetails', 'Tenant Details'),
			content: <EditTenantDetails id={id!} />,
		},
		{
			title: t('Manage.Tenants.Edit.Tab_SubscriptionDetails', 'Subscription Details'),
			content: <ViewTenantSubscriptions id={id!} />,
		},
		{
			title: t('Manage.Tenants.Edit.Tab_TenantUsers', 'Tenant Users'),
			content: <ViewTenantUsers id={id!} />,
		},
	]

	return (
		<>
			<>
				<PageBreadcrumbsWithLinks title={t('Manage.Tenants.Edit.Heading', 'Heading')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Tenants.Breadcrumb', 'Tenants'), link: MenuLinks.ManageTenants }, { label: t('Manage.Tenants.Edit.Breadcrumb', 'Edit') }]} />
				{id && (
					<Tab.Group>
						<Tab.List as="nav" className="permission-tabs">
							{tabContents.map((tab, idx) => (
								<Tab key={idx} className={({ selected }) => (selected ? 'permission-tab permission-tab--selected' : 'permission-tab permission-tab--unselected')}>
									{tab.title}
								</Tab>
							))}
						</Tab.List>

						<Tab.Panels className="border border-t-transparent dark:border-gray-600">
							{tabContents.map((tab, idx) => (
								<Tab.Panel key={idx}>{tab.content ?? <EmptyState title={t('Common.NoContentAvailable', 'No content available')} />}</Tab.Panel>
							))}
						</Tab.Panels>
					</Tab.Group>
				)}
			</>
		</>
	)
}
export default EditTenant
