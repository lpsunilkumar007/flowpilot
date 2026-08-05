import { PageBreadcrumbsWithLinks } from '@/components'
import { PageBody, PageWrapper } from '@/components/PageWrapper'
import withSuspense from '@/helpers/suspense.helper'
import { lazy } from 'react'
import { useTranslation } from 'react-i18next'

const MyTeamPanels = withSuspense(lazy(() => import('./Components/MyTeamPanels')))

const MyTeam: React.FC = () => {
	const { t } = useTranslation()

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.MyTeam_Heading', 'My Team')} subNames={[{ label: t('Manage.MyTeam.Breadcrumb', 'My Team') }]} />
			<PageWrapper>
				<PageBody>
					<MyTeamPanels />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default MyTeam
