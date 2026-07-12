import { PageBreadcrumbsWithLinks } from '@/components'
import withSuspense from '@/helpers/suspense.helper'
import { lazy } from 'react'
import { useTranslation } from 'react-i18next'

const EditUserProfile = withSuspense(lazy(() => import('./Components/EditUserProfile')))
const ChangeUserPassword = withSuspense(lazy(() => import('@/components/ChangeUserPassword')))
const UserTwoFactorAuthentication = withSuspense(lazy(() => import('./Components/UserTwoFactorAuthentication')))

const ManageProfile = () => {
	const { t } = useTranslation()
	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Profile_Heading', 'Profile')} subNames={[{ label: t('Manage.Profile_SubName', 'Profile') }, { label: t('Manage.Profile_Breadcrumb', 'Profile') }]}></PageBreadcrumbsWithLinks>
			<div className="grid xl:grid-cols-12 lg:grid-cols-12 grid-cols-1 gap-6">
				<div className="xl:col-span-6 lg:col-span-5">
					<EditUserProfile />
				</div>

				<div className="xl:col-span-6 lg:col-span-7">
					<ChangeUserPassword variant="inline" />
				</div>
			</div>
			<div className="w-full">
				<UserTwoFactorAuthentication />
			</div>
		</>
	)
}

export default ManageProfile
