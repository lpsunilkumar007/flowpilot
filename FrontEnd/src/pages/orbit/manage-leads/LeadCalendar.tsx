import PageBreadcrumbsWithLinks from '@/components/PageBreadcrumbsWithLinks'
import { PageBody, PageWrapper } from '@/components/PageWrapper'
import withSuspense from '@/helpers/suspense.helper'
import React, { lazy } from 'react'
import { useTranslation } from 'react-i18next'

const ViewLeadFollowUpCalendar = withSuspense(lazy(() => import('./Components/ViewLeadFollowUpCalendar')))

const LeadCalendar: React.FC = () => {
	const { t } = useTranslation()

	return (
		<>
			<PageBreadcrumbsWithLinks
				title={t('Manage.Leads.Calendar_Heading', 'Follow-up Calendar')}
				subNames={[{ label: t('Manage.Leads.Calendar_Breadcrumb', 'Calendar') }]}
			/>

			<PageWrapper>
				<PageBody>
					<ViewLeadFollowUpCalendar />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default LeadCalendar
