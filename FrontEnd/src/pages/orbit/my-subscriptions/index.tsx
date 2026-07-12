import { useTranslation } from 'react-i18next'
import { PageBreadcrumbsWithLinks } from '@/components'
import withSuspense from '@/helpers/suspense.helper'
import { lazy } from 'react'

const ViewTenantSubscriptions = withSuspense(lazy(() => import('../manage-tenants/Components/ViewTenantSubscriptions')))

const MySubscriptions = () => {
	const { t } = useTranslation()
	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.My_Subscriptions_Heading', 'My Subscriptions')} subNames={[{ label: t('Manage.Profile_SubName', 'Profile') }, { label: t('Manage.My_Subscriptions_Breadcrumb', 'My Subscriptions') }]}></PageBreadcrumbsWithLinks>
			<ViewTenantSubscriptions id={null} />
		</>
	)
}

export default MySubscriptions
