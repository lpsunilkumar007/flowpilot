import { EmptyState, PageBreadcrumbsWithLinks } from '@/components'
import { MenuLinks } from '@/constants/menu'
import withSuspense from '@/helpers/suspense.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import { userService } from '@/services/UserService'
import type { ViewLeadDetailResponse } from '@/types/crm/lead.types'
import type { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { Tab } from '@headlessui/react'
import { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { leadCardClass } from '../helpers/leadDisplay.helper'
import LeadDetailHeader from './shared/LeadDetailHeader'

const EditLeadOverview = withSuspense(lazy(() => import('./EditLeadOverview')))
const ViewLeadActivities = withSuspense(lazy(() => import('./ViewLeadActivities')))
const ViewLeadFollowUps = withSuspense(lazy(() => import('./ViewLeadFollowUps')))
const ViewLeadNotes = withSuspense(lazy(() => import('./ViewLeadNotes')))
const ViewLeadHistory = withSuspense(lazy(() => import('./ViewLeadHistory')))

const EditLeadLandingPage = () => {
	const { id } = useParams<{ id: string }>()
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [lead, setLead] = useState<ViewLeadDetailResponse | null>(null)
	const [users, setUsers] = useState<ViewUserDetailsResponse[]>([])

	useEffect(() => {
		if (!id) return
		const load = async () => {
			setLoading(true)
			try {
				const [leadRes, userList] = await Promise.all([leadService.getById(Number(id)), userService.getList()])
				setLead(leadRes)
				setUsers(userList)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id])

	const refreshLead = () => id && leadService.getById(Number(id)).then(setLead)

	const tabContents = [
		{ title: t('Manage.Leads.Tab_Overview', 'Overview'), icon: 'ri-dashboard-line', content: id ? <EditLeadOverview id={id} onLeadUpdated={refreshLead} /> : null },
		{ title: t('Manage.Leads.Tab_Activities', 'Activities'), icon: 'ri-time-line', content: id ? <ViewLeadActivities id={id} /> : null },
		{ title: t('Manage.Leads.Tab_FollowUps', 'Follow-ups'), icon: 'ri-calendar-check-line', content: id ? <ViewLeadFollowUps id={id} /> : null },
		{ title: t('Manage.Leads.Tab_Notes', 'Notes'), icon: 'ri-sticky-note-line', content: id ? <ViewLeadNotes id={id} /> : null },
		{ title: t('Manage.Leads.Tab_History', 'History'), icon: 'ri-history-line', content: id ? <ViewLeadHistory id={id} /> : null },
	]

	return (
		<div className="space-y-6">
			<PageBreadcrumbsWithLinks
				title={t('Manage.Leads.Detail_Heading', 'Lead Details')}
				subNames={[
					{ label: t('Manage.Leads_Heading', 'Leads'), link: MenuLinks.ManageLeads },
					{ label: t('Manage.Leads.Detail.Breadcrumb', 'Details') },
				]}
			/>

			{loading && <AnimationSkeleton />}
			{!loading && lead && <LeadDetailHeader lead={lead} users={users} />}

			{id && !loading && (
				<div className={`${leadCardClass} overflow-hidden`}>
					<Tab.Group>
						<Tab.List className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/40">
							{tabContents.map((tab, idx) => (
								<Tab
									key={idx}
									className={({ selected }) =>
										`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
											selected
												? 'bg-white text-primary shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-600'
												: 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'
										}`
									}
								>
									<i className={tab.icon} />
									{tab.title}
								</Tab>
							))}
						</Tab.List>
						<Tab.Panels>
							{tabContents.map((tab, idx) => (
								<Tab.Panel key={idx} className="p-1 sm:p-2">
									{tab.content ?? <EmptyState title={t('Common.NoContentAvailable', 'No content available')} />}
								</Tab.Panel>
							))}
						</Tab.Panels>
					</Tab.Group>
				</div>
			)}
		</div>
	)
}

export default EditLeadLandingPage
