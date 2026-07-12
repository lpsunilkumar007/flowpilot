import { FormInput, VerticalForm } from '@/components'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import { userService } from '@/services/UserService'
import { InterestLevel, LeadPriority, LeadStatus, type UpdateLeadRequest, type ViewLeadDetailResponse } from '@/types/crm/lead.types'
import type { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LeadSectionCard from './shared/LeadSectionCard'

interface EditLeadOverviewProps {
	id: string
	onLeadUpdated?: () => void
}

const EditLeadOverview: React.FC<EditLeadOverviewProps> = ({ id, onLeadUpdated }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [lead, setLead] = useState<ViewLeadDetailResponse | null>(null)
	const [users, setUsers] = useState<ViewUserDetailsResponse[]>([])
	const [statusUpdate, setStatusUpdate] = useState<LeadStatus | string>('')
	const [assignUserId, setAssignUserId] = useState('')

	const reload = async () => {
		const leadRes = await leadService.getById(Number(id))
		setLead(leadRes)
		setStatusUpdate(leadRes.leadStatus)
		setAssignUserId(leadRes.assignedToUserId)
		onLeadUpdated?.()
	}

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			try {
				const [leadRes, userList] = await Promise.all([leadService.getById(Number(id)), userService.getList()])
				setLead(leadRes)
				setStatusUpdate(leadRes.leadStatus)
				setAssignUserId(leadRes.assignedToUserId)
				setUsers(userList)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id])

	const onSubmit = async (formInfo: UpdateLeadRequest) => {
		await runWithToast(() => leadService.update(Number(id), { ...formInfo, id: Number(id) }), {
			onSuccess: async (msg) => {
				messageHelper.showSuccess(msg)
				await reload()
			},
		})
	}

	const handleStatusUpdate = async () => {
		if (statusUpdate === '') return
		await runWithToast(() => leadService.updateStatus(Number(id), { leadStatus: statusUpdate as LeadStatus }), {
			onSuccess: async (msg) => {
				messageHelper.showSuccess(msg)
				await reload()
			},
		})
	}

	const handleAssign = async () => {
		if (!assignUserId) return
		await runWithToast(() => leadService.assign(Number(id), { assignedToUserId: assignUserId }), {
			onSuccess: async (msg) => {
				messageHelper.showSuccess(msg)
				await reload()
			},
		})
	}

	if (loading || !lead) return <AnimationSkeleton />

	const defaultValues: UpdateLeadRequest = {
		id: lead.id,
		businessName: lead.businessName,
		businessType: lead.businessType,
		currentPOS: lead.currentPOS,
		website: lead.website,
		gstNumber: lead.gstNumber,
		pan: lead.pan,
		numberOfOutlets: lead.numberOfOutlets,
		expectedMonthlyBilling: lead.expectedMonthlyBilling,
		expectedRevenue: lead.expectedRevenue,
		companySize: lead.companySize,
		ownerName: lead.ownerName,
		designation: lead.designation,
		mobile: lead.mobile,
		whatsApp: lead.whatsApp,
		email: lead.email,
		alternatePhone: lead.alternatePhone,
		country: lead.country,
		state: lead.state,
		city: lead.city,
		area: lead.area,
		pincode: lead.pincode,
		fullAddress: lead.fullAddress,
		googleMapsLink: lead.googleMapsLink,
		leadSource: lead.leadSource,
		assignedToUserId: lead.assignedToUserId,
		priority: lead.priority,
		leadStatus: lead.leadStatus,
		expectedClosingDate: lead.expectedClosingDate,
		interestLevel: lead.interestLevel,
		painPoints: lead.painPoints,
		competitors: lead.competitors,
		requirements: lead.requirements,
		isArchived: lead.isArchived,
	}

	const statusOptions = Object.values(LeadStatus).filter((v) => typeof v === 'string') as string[]

	return (
		<div className="space-y-6 p-4">
			<LeadSectionCard title={t('Manage.Leads.QuickActions', 'Quick actions')} subtitle={t('Manage.Leads.QuickActions_Sub', 'Update pipeline without opening the full form')} icon="ri-flashlight-line">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/40">
						<label className="form-label">{t('Manage.Leads.UpdateStatus', 'Update status')}</label>
						<div className="mt-2 flex gap-2">
							<select className="form-select flex-1" value={String(statusUpdate)} onChange={(e) => setStatusUpdate(e.target.value)}>
								{statusOptions.map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(opt)}
									</option>
								))}
							</select>
							<button type="button" className="btn btn-primary" onClick={handleStatusUpdate}>
								{t('Common.Update', 'Update')}
							</button>
						</div>
					</div>
					<div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/40">
						<label className="form-label">{t('Manage.Leads.Reassign', 'Reassign lead')}</label>
						<div className="mt-2 flex gap-2">
							<select className="form-select flex-1" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email}
									</option>
								))}
							</select>
							<button type="button" className="btn btn-primary" onClick={handleAssign}>
								{t('Common.Assign', 'Assign')}
							</button>
						</div>
					</div>
				</div>
			</LeadSectionCard>

			<LeadSectionCard title={t('Manage.Leads.EditDetails', 'Lead details')} subtitle={t('Manage.Leads.EditDetails_Sub', 'Keep information accurate for your team')} icon="ri-edit-box-line">
				<VerticalForm<UpdateLeadRequest> onSubmit={onSubmit} defaultValues={defaultValues}>
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
						<FormInput label={t('Manage.Leads.BusinessName', 'Business Name')} required name="businessName" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.BusinessType', 'Business Type')} required name="businessType" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.OwnerName', 'Owner Name')} required name="ownerName" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.Mobile', 'Mobile')} required name="mobile" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.Email', 'Email')} name="email" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.LeadSource', 'Lead Source')} required name="leadSource" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.AssignedTo', 'Assigned To')} required name="assignedToUserId" type="bottom-sheet" className="form-select">
							{users.map((u) => (
								<option key={u.id} value={u.id}>
									{`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email}
								</option>
							))}
						</FormInput>
						<FormInput label={t('Manage.Leads.ExpectedRevenue', 'Expected Revenue')} name="expectedRevenue" type="number" className="form-input" />
						<FormInput label={t('Manage.Leads.Priority', 'Priority')} name="priority" type="bottom-sheet" className="form-select">
							{Object.values(LeadPriority)
								.filter((v) => typeof v === 'number')
								.map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(LeadPriority[opt as number])}
									</option>
								))}
						</FormInput>
						<FormInput label={t('Manage.Leads.InterestLevel', 'Interest Level')} name="interestLevel" type="bottom-sheet" className="form-select">
							{Object.values(InterestLevel)
								.filter((v) => typeof v === 'number')
								.map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(InterestLevel[opt as number])}
									</option>
								))}
						</FormInput>
						<FormInput label={t('Manage.Leads.FullAddress', 'Full Address')} name="fullAddress" type="textarea" className="form-input md:col-span-2" />
						<FormInput label={t('Manage.Leads.PainPoints', 'Pain Points')} name="painPoints" type="textarea" className="form-input" />
						<FormInput label={t('Manage.Leads.Competitors', 'Competitors')} name="competitors" type="textarea" className="form-input" />
						<FormInput label={t('Manage.Leads.IsArchived', 'Archived')} name="isArchived" type="checkbox" className="form-checkbox" />
					</div>
					<div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
						<button type="submit" className="btn btn-primary">
							{t('Common.SaveChanges', 'Save changes')}
						</button>
					</div>
				</VerticalForm>
			</LeadSectionCard>
		</div>
	)
}

export default EditLeadOverview
