import { EmptyState, FormInput, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import { LeadActivityType, type CreateLeadActivityRequest, type ViewLeadActivityResponse } from '@/types/crm/lead.types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatActivityType, getActivityIcon, leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'
// form validation
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
interface ViewLeadActivitiesProps {
	id: string
}

const ViewLeadActivities: React.FC<ViewLeadActivitiesProps> = ({ id }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const canView = userHasPermission(PermissionTypes.Permissions_ManageLeadActivities_View)
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageLeadActivities_Create)
	const [loading, setLoading] = useState(true)
	const [activities, setActivities] = useState<ViewLeadActivityResponse[]>([])

	const load = async () => {
		if (!canView) {
			setActivities([])
			setLoading(false)
			return
		}
		setLoading(true)
		try {
			const res = await leadService.getActivities(Number(id))
			setActivities(res)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [id, canView])

	const schemaResolver = yupResolver(
		yup.object().shape({
			activityType: yup.string().required('This field cannot be left empty'),
			activityDate: yup.string().required('This field cannot be left empty'),
		})
	)

	const onSubmit = async (formInfo: CreateLeadActivityRequest) => {
		await runWithToast(() => leadService.createActivity(Number(id), formInfo), {
			onSuccess: () => {
				messageHelper.showSuccess(t('Manage.Leads.ActivityAdded', 'Activity added'))
				load()
			},
		})
	}

	if (loading) return <AnimationSkeleton />

	if (!canView) {
		return (
			<div className="p-4">
				<EmptyState title={t('Common.NoPermission', 'You do not have permission to view activities')} />
			</div>
		)
	}

	return (
		<div className="space-y-6 p-4">
			{canCreate && (
				<LeadSectionCard title={t('Manage.Leads.AddActivity', 'Log activity')} subtitle={t('Manage.Leads.AddActivity_Sub', 'Calls, demos, visits and more')} icon="ri-add-circle-line">
					<VerticalForm<any>
						onSubmit={onSubmit}
						resolver={schemaResolver}
						defaultValues={{
							activityType: LeadActivityType.Call,
							activityDate: new Date().toISOString().split('T')[0],
						}}
					>
						<div className="grid gap-4 md:grid-cols-2">
							<FormInput label={t('Manage.Leads.ActivityType', 'Activity Type')} required name="activityType" type="bottom-sheet" className="form-select">
								{Object.values(LeadActivityType)
									.filter((v) => typeof v === 'number')
									.map((opt) => (
										<option key={opt} value={opt}>
											{formatHelper.punctuateLabel(LeadActivityType[opt as number])}
										</option>
									))}
							</FormInput>
							<FormInput label={t('Manage.Leads.ActivityDate', 'Activity Date')} required name="activityDate" type="date" className="form-input" />
							<FormInput label={t('Manage.Leads.Duration', 'Duration (mins)')} name="durationMinutes" type="number" className="form-input" />
							<FormInput label={t('Manage.Leads.Outcome', 'Outcome')} name="outcome" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.NextFollowUpDate', 'Next Follow-up Date')} name="nextFollowUpDate" type="date" className="form-input" />
							<FormInput label={t('Manage.Leads.Notes', 'Notes')} name="notes" type="textarea" className="form-input md:col-span-2" />
						</div>
						<div className="mt-4 flex justify-end">
							<button type="submit" className="btn btn-primary">
								{t('Manage.Leads.AddActivity', 'Add activity')}
							</button>
						</div>
					</VerticalForm>
				</LeadSectionCard>
			)}

			<LeadSectionCard title={t('Manage.Leads.ActivityTimeline', 'Activity timeline')} subtitle={t('Manage.Leads.ActivityTimeline_Sub', 'Most recent first')} icon="ri-time-line">
				{activities.length === 0 ? (
					<div className="py-8 text-center text-gray-500">
						<i className="ri-calendar-event-line text-3xl" />
						<p className="mt-2">{t('Manage.Leads.NoActivities', 'No activities yet.')}</p>
					</div>
				) : (
					<div className="space-y-4">
						{activities.map((a) => (
							<div key={a.id} className={`${leadCardClass} flex gap-4 p-4`}>
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<i className={`${getActivityIcon(a.activityType)} text-lg`} />
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<h4 className="font-semibold text-gray-900 dark:text-gray-100">{formatActivityType(a.activityType)}</h4>
										<span className="text-sm text-gray-500">{formatHelper.MomentDateFormat(a.activityDate)}</span>
									</div>
									{a.outcome && <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{a.outcome}</p>}
									{a.notes && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{a.notes}</p>}
									{a.nextFollowUpDate && <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Next follow-up: {formatHelper.MomentDateFormat(a.nextFollowUpDate)}</p>}
								</div>
							</div>
						))}
					</div>
				)}
			</LeadSectionCard>
		</div>
	)
}

export default ViewLeadActivities
