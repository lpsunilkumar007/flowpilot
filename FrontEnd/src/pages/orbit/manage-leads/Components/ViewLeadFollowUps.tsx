import ActionDropdown from '@/components/ActionDropdown'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { ModalLayout } from '@/components/HeadlessUI'
import { MODAL_PANEL_CLASS } from '@/constants'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import withSuspense from '@/helpers/suspense.helper'
import { usePermission } from '@/hooks/usePermission'
import { leadService } from '@/services/LeadService'
import { FollowUpStatus, FollowUpType, type ViewLeadDetailResponse, type ViewLeadFollowUpResponse } from '@/types/crm/lead.types'
import React, { lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'

const EditFollowUpModal = withSuspense(lazy(() => import('./EditFollowUpModal')))

interface ViewLeadFollowUpsProps {
	lead: ViewLeadDetailResponse
	onLeadUpdated?: () => void | Promise<void>
}

const statusTone: Record<string, string> = {
	Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
	Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
	Missed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
	Cancelled: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
}

const isPendingStatus = (status: FollowUpStatus | string) => {
	if (typeof status === 'string') return status === 'Pending'
	return status === FollowUpStatus.Pending
}

const ViewLeadFollowUps: React.FC<ViewLeadFollowUpsProps> = ({ lead, onLeadUpdated }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const followUps = lead.followUps ?? []
	const [editingFollowUp, setEditingFollowUp] = useState<ViewLeadFollowUpResponse | null>(null)
	const [cancelTarget, setCancelTarget] = useState<ViewLeadFollowUpResponse | null>(null)
	const [isCancelling, setIsCancelling] = useState(false)

	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageLeads_Update) || userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_Update)

	const formatFollowUpStatus = (status: FollowUpStatus | string) => {
		if (typeof status === 'string') return formatHelper.punctuateLabel(status)
		return formatHelper.punctuateLabel(FollowUpStatus[status])
	}

	const formatFollowUpType = (type: FollowUpType | string) => {
		if (typeof type === 'string') return formatHelper.punctuateLabel(type)
		return formatHelper.punctuateLabel(FollowUpType[type])
	}

	const handleEditClose = async (saved: boolean) => {
		setEditingFollowUp(null)
		if (saved) await onLeadUpdated?.()
	}

	const handleCancel = async () => {
		if (!cancelTarget || isCancelling) return

		await runWithToast(() => leadService.cancelFollowUp(lead.id, cancelTarget.id), {
			setLoading: setIsCancelling,
			onSuccess: async (response) => {
				messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Leads.FollowUp_Cancelled', 'Follow-up cancelled successfully'))
				setCancelTarget(null)
				await onLeadUpdated?.()
			},
		})
	}

	return (
		<div className="p-4">
			<LeadSectionCard title={t('Manage.Leads.FollowUps', 'Follow-ups')} subtitle={t('Manage.Leads.FollowUps_Sub', 'Scheduled touchpoints')} icon="ri-calendar-check-line">
				{followUps.length === 0 ? (
					<div className="py-8 text-center text-gray-500">
						<i className="ri-calendar-line text-3xl" />
						<p className="mt-2">{t('Manage.Leads.NoFollowUps', 'No follow-ups scheduled.')}</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{followUps.map((f) => {
							const statusKey = typeof f.followUpStatus === 'string' ? f.followUpStatus : FollowUpStatus[f.followUpStatus]
							return (
								<div key={f.id} className={`${leadCardClass} p-4`}>
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-sm text-gray-500">{formatFollowUpType(f.followUpType)}</p>
											<p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatHelper.MomentDateFormat(f.nextFollowUpDate)}</p>
										</div>
										<div className="flex items-center gap-4">
											<span
												className={`rounded-full px-2.5 py-3 text-xs font-medium 
											${statusTone[statusKey] ?? statusTone.Pending}`}
											>
												{formatFollowUpStatus(f.followUpStatus)}
											</span>
											{canUpdate && isPendingStatus(f.followUpStatus) && (
												<ActionDropdown
													label={t('Common.Action', 'Action')}
													menuWidth={140}
													minWidthPx={140}
													items={[
														{
															key: 'edit',
															label: t('Common.Edit', 'Edit'),
															onClick: () => setEditingFollowUp(f),
														},
														{
															key: 'delete',
															label: t('Common.Cancel', 'Cancel'),
															onClick: () => setCancelTarget(f),
														},
													]}
												/>
											)}
										</div>
									</div>
									{f.reminderNote && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{f.reminderNote}</p>}
								</div>
							)
						})}
					</div>
				)}
			</LeadSectionCard>

			<ModalLayout isStatic={true} showModal={Boolean(editingFollowUp)} toggleModal={() => setEditingFollowUp(null)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{editingFollowUp && <EditFollowUpModal leadId={lead.id} followUp={editingFollowUp} onClose={handleEditClose} />}
			</ModalLayout>

			<DeleteConfirmation
				isOpen={Boolean(cancelTarget)}
				onClose={() => {
					if (!isCancelling) setCancelTarget(null)
				}}
				onConfirm={handleCancel}
				title={t('Manage.Leads.CancelFollowUp_Title', 'Cancel Follow-up')}
				description={t('Manage.Leads.CancelFollowUp_Description', 'Are you sure you want to cancel this follow-up?')}
				confirmButtonText={t('Manage.Leads.CancelFollowUp_Confirm', 'Cancel Follow-up')}
				confirmDisabled={isCancelling}
			/>
		</div>
	)
}

export default ViewLeadFollowUps
