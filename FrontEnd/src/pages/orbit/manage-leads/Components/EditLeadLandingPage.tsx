import { EmptyState, PageBreadcrumbsWithLinks } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import type { UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import withSuspense from '@/helpers/suspense.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { leadService } from '@/services/LeadService'
import type { ViewLeadDetailResponse } from '@/types/crm/lead.types'
import { Tab } from '@headlessui/react'
import { lazy, useCallback, useEffect, useMemo, useState } from 'react'
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
	const { userHasPermission } = usePermission()
	const canViewActivities = userHasPermission(PermissionTypes.Permissions_ManageLeadActivities_View)
	const canViewNotes = userHasPermission(PermissionTypes.Permissions_ManageLeadNotes_View)
	const [loading, setLoading] = useState(true)
	const [lead, setLead] = useState<ViewLeadDetailResponse | null>(null)
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])

	useEffect(() => {
		if (!id) return
		const load = async () => {
			setLoading(true)
			try {
				const [leadRes, userList] = await Promise.all([leadService.getById(Number(id)), DropDownService.getSystemUsers(false)])
				setLead(leadRes)
				setUsers(userList ?? [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id])

	const refreshLead = useCallback(() => {
		if (!id) return Promise.resolve()
		return leadService.getById(Number(id)).then(setLead)
	}, [id])

	const tabContents = useMemo(
		() =>
			[
				{ title: t('Manage.Leads.Tab_Overview', 'Overview'), icon: 'ri-dashboard-line', content: id && lead ? <EditLeadOverview id={id} lead={lead} onLeadUpdated={refreshLead} /> : null, visible: true },
				{ title: t('Manage.Leads.Tab_Activities', 'Activities'), icon: 'ri-time-line', content: id ? <ViewLeadActivities id={id} /> : null, visible: canViewActivities },
				{ title: t('Manage.Leads.Tab_FollowUps', 'Follow-ups'), icon: 'ri-calendar-check-line', content: lead ? <ViewLeadFollowUps lead={lead} /> : null, visible: true },
				{ title: t('Manage.Leads.Tab_Notes', 'Notes'), icon: 'ri-sticky-note-line', content: id ? <ViewLeadNotes id={id} /> : null, visible: canViewNotes },
				{ title: t('Manage.Leads.Tab_History', 'History'), icon: 'ri-history-line', content: lead ? <ViewLeadHistory lead={lead} /> : null, visible: true },
			].filter((tab) => tab.visible),
		[id, t, canViewActivities, canViewNotes, lead, refreshLead]
	)

	return (
		<div className="space-y-6">
			<PageBreadcrumbsWithLinks title={t('Manage.Leads.Detail_Heading', 'Lead Details')} subNames={[{ label: t('Manage.Leads_Heading', 'Leads'), link: MenuLinks.ManageLeads }, { label: t('Manage.Leads.Detail.Breadcrumb', 'Details') }]} />

			{loading && <AnimationSkeleton />}
			{!loading && lead && <LeadDetailHeader lead={lead} users={users} />}

			{id && !loading && (
				<div className={`${leadCardClass} overflow-hidden`}>
					<Tab.Group>
						<Tab.List className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/40">
							{tabContents.map((tab, idx) => (
								<Tab key={idx} className={({ selected }) => `inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${selected ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-600' : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'}`}>
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
