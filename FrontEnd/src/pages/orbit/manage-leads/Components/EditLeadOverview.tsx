import { EntityCustomFields, FormInput, VerticalForm, type EntityCustomFieldsHandle } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import type { UserDropDownItemResponse, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { LookUpCodeTypes } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { RootState } from '@/redux/store'
import { DropDownService } from '@/services/DropDownService'
import { leadService } from '@/services/LeadService'
import { InterestLevel, LeadPriority, type UpdateLeadRequest, type ViewLeadDetailResponse } from '@/types/crm/lead.types'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import AssignSalesPersonFields from './shared/AssignSalesPersonFields'
import LeadSectionCard from './shared/LeadSectionCard'
// form validation
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface EditLeadOverviewProps {
	id: string
	onLeadUpdated?: () => void
}

const isSameUserId = (left?: string | null, right?: string | null) => Boolean(left && right && left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0)

const parseLeadMetadata = (raw?: string): Record<string, string> => {
	if (!raw?.trim()) return {}
	try {
		const parsed = JSON.parse(raw) as unknown
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
		const result: Record<string, string> = {}
		for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
			if (value == null) continue
			const text = String(value).trim()
			if (text) result[key] = text
		}
		return result
	} catch {
		return {}
	}
}

const metadataHref = (value: string): string | undefined => {
	if (/^https?:\/\//i.test(value)) return value
	if (/^(www\.)?linkedin\.com\//i.test(value)) return `https://${value.replace(/^\/+/, '')}`
	return undefined
}

const EditLeadOverview: React.FC<EditLeadOverviewProps> = ({ id, onLeadUpdated }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageLeads_Update)
	const userData = useSelector((state: RootState) => state.Auth.userData) as ViewUserDetailsResponse | undefined
	const currentUserId = userData?.id
	const [loading, setLoading] = useState(true)
	const [lead, setLead] = useState<ViewLeadDetailResponse | null>(null)
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
	const [leadStatuses, setLeadStatuses] = useState<{ value: number; text: string }[]>([])
	const [leadSources, setLeadSources] = useState<{ value: number; text: string }[]>([])
	const [statusUpdate, setStatusUpdate] = useState<number | ''>('')
	const [assignUserId, setAssignUserId] = useState('')
	const [assignToYourself, setAssignToYourself] = useState(false)
	const [formKey, setFormKey] = useState(0)
	const customFieldsRef = useRef<EntityCustomFieldsHandle>(null)

	const syncAssigneeState = (assignedToUserId: string) => {
		const assignedToSelf = isSameUserId(assignedToUserId, currentUserId)
		setAssignToYourself(assignedToSelf)
		setAssignUserId(assignedToSelf ? '' : assignedToUserId)
	}

	const reload = async () => {
		const leadRes = await leadService.getById(Number(id))
		setLead(leadRes)
		setStatusUpdate(leadRes.leadStatusId)
		syncAssigneeState(leadRes.assignedToUserId)
		setFormKey((k) => k + 1)
		onLeadUpdated?.()
	}

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			try {
				const [leadRes, userList, statusList, sourceList] = await Promise.all([
					leadService.getById(Number(id)),
					DropDownService.getDirectReportSystemUsers(),
					DropDownService.getLookUpCodeValues(LookUpCodeTypes.LeadStatus),
					DropDownService.getLookUpCodeValues(LookUpCodeTypes.LeadSource),
				])
				setLead(leadRes)
				setStatusUpdate(leadRes.leadStatusId)
				const assignedToSelf = isSameUserId(leadRes.assignedToUserId, currentUserId)
				setAssignToYourself(assignedToSelf)
				setAssignUserId(assignedToSelf ? '' : leadRes.assignedToUserId)
				setUsers(userList ?? [])
				setLeadStatuses((statusList ?? []).map((item) => ({ value: item.value, text: item.text })))
				setLeadSources((sourceList ?? []).map((item) => ({ value: item.value, text: item.text })))
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id, currentUserId])

	const schemaResolver = yupResolver(
		yup.object().shape({
			id: yup.number().required('This field cannot be left empty'),
			businessName: yup.string().required('This field cannot be left empty'),
			businessType: yup.string().required('This field cannot be left empty'),
			ownerName: yup.string().required('This field cannot be left empty'),
			mobile: yup.string().required('Please enter Mobile Number'),
			leadSourceId: yup.number().required('Please select a value'),
			assignToYourself: yup.boolean(),
			assignedToUserId: yup.string().when('assignToYourself', {
				is: true,
				then: (schema) => schema.optional().nullable(),
				otherwise: (schema) => schema.required('Please select a value'),
			}),
			email: yup.string().email('Please enter a valid email address').nullable(),
		})
	)
	const showBackendSuccess = (response?: string) => {
		messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Leads.Updated', 'Lead updated successfully'))
	}

	const onSubmit = async (formInfo: UpdateLeadRequest) => {
		if (customFieldsRef.current && !customFieldsRef.current.validate()) {
			return
		}

		const assignToSelf = !!formInfo.assignToYourself
		await runWithToast(
			() =>
				leadService.update(Number(id), {
					...formInfo,
					id: Number(id),
					assignToYourself: assignToSelf,
					assignedToUserId: assignToSelf ? undefined : formInfo.assignedToUserId,
					...(lead?.metadata != null ? { metadata: lead.metadata } : {}),
					customFieldRequests: customFieldsRef.current?.getFields(),
				} as UpdateLeadRequest),
			{
				onSuccess: (response) => {
					showBackendSuccess(response)
					void reload()
				},
			}
		)
	}

	const handleStatusUpdate = async () => {
		if (statusUpdate === '') return
		await runWithToast(() => leadService.updateStatus(Number(id), { leadStatusId: statusUpdate as number }), {
			onSuccess: (response) => {
				showBackendSuccess(response)
				void reload()
			},
		})
	}

	const handleAssign = async () => {
		if (!assignToYourself && !assignUserId) return
		await runWithToast(
			() =>
				leadService.assign(Number(id), {
					assignToYourself,
					assignedToUserId: assignToYourself ? undefined : assignUserId,
				}),
			{
				onSuccess: (response) => {
					showBackendSuccess(response)
					void reload()
				},
			}
		)
	}

	if (loading || !lead) return <AnimationSkeleton />

	const assignedToSelf = isSameUserId(lead.assignedToUserId, currentUserId)
	const metadataMap = parseLeadMetadata(lead.metadata)
	const metadataRows = Object.entries(metadataMap).map(([key, value]) => ({ key, value }))

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
		leadSourceId: lead.leadSourceId,
		assignToYourself: assignedToSelf,
		assignedToUserId: assignedToSelf ? undefined : lead.assignedToUserId,
		priority: lead.priority,
		leadStatusId: lead.leadStatusId,
		expectedClosingDate: lead.expectedClosingDate,
		interestLevel: lead.interestLevel,
		painPoints: lead.painPoints,
		competitors: lead.competitors,
		requirements: lead.requirements,
		isArchived: lead.isArchived,
	}

	const statusOptions = leadStatuses

	return (
		<div className="space-y-6 p-4">
			{canUpdate && (
				<LeadSectionCard title={t('Manage.Leads.QuickActions', 'Quick actions')} subtitle={t('Manage.Leads.QuickActions_Sub', 'Update pipeline without opening the full form')} icon="ri-flashlight-line">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/40">
							<label className="form-label">{t('Manage.Leads.UpdateStatus', 'Update status')}</label>
							<div className="mt-2 flex gap-2">
								<select className="form-select flex-1" value={String(statusUpdate)} onChange={(e) => setStatusUpdate(Number(e.target.value))}>
									{statusOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{formatHelper.punctuateLabel(opt.text)}
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
							<div className="mt-2 space-y-3">
								<div>
									<label className="form-label" htmlFor="quickAssignToYourself">
										{t('Manage.Leads.AssignToYourself', 'Assign to yourself')}
									</label>
									<div className="flex items-center">
										<input
											type="checkbox"
											className="form-switch text-primary"
											id="quickAssignToYourself"
											checked={assignToYourself}
											onChange={(e) => {
												setAssignToYourself(e.target.checked)
												if (e.target.checked) setAssignUserId('')
											}}
										/>
									</div>
								</div>
								<div className="flex gap-2">
									{!assignToYourself && (
										<select className="form-select flex-1" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
											<option value="">{t('Common.Select', 'Select')}</option>
											{users.map((u) => (
												<option key={u.strValue} value={u.strValue}>
													{u.text}
												</option>
											))}
										</select>
									)}
									<button type="button" className="btn btn-primary" onClick={handleAssign}>
										{t('Common.Assign', 'Assign')}
									</button>
								</div>
							</div>
						</div>
					</div>
				</LeadSectionCard>
			)}

			<LeadSectionCard title={t('Manage.Leads.EditDetails', 'Lead details')} subtitle={t('Manage.Leads.EditDetails_Sub', 'Keep information accurate for your team')} icon="ri-edit-box-line">
				<VerticalForm<any> key={formKey} onSubmit={onSubmit} resolver={schemaResolver} defaultValues={defaultValues}>
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
						<FormInput label={t('Manage.Leads.BusinessName', 'Business Name')} required name="businessName" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.BusinessType', 'Business Type')} required name="businessType" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.OwnerName', 'Owner Name')} required name="ownerName" type="text" className="form-input" />
						<FormInput label={t('Manage.Leads.Mobile', 'Mobile')} required name="mobile" type="number" className="form-input" />
						<FormInput label={t('Manage.Leads.Email', 'Email')} name="email" type="email" className="form-input" />
						<FormInput label={t('Manage.Leads.LeadSource', 'Lead Source')} required name="leadSourceId" type="bottom-sheet" className="form-select">
							<option value="">{t('Common.Select', 'Select')}</option>
							{leadSources.map((source) => (
								<option key={source.value} value={source.value}>
									{source.text}
								</option>
							))}
						</FormInput>
						<AssignSalesPersonFields users={users} assignedLabel={t('Manage.Leads.AssignedTo', 'Assigned To')} />
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
					<EntityCustomFields
						key={formKey}
						ref={customFieldsRef}
						entityId={Number(id)}
						initialFields={lead.customFields}
						readOnly={!canUpdate}
						embedded
					/>
					{canUpdate && (
						<div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
							<button type="submit" className="btn btn-primary">
								{t('Common.SaveChanges', 'Save changes')}
							</button>
						</div>
					)}
				</VerticalForm>
			</LeadSectionCard>

			{metadataRows.length > 0 && (
				<LeadSectionCard
					title={t('Manage.Leads.ImportedMetadata', 'Additional Information')}
					subtitle={t('Manage.Leads.ImportedMetadata_Sub', 'Additional details captured when this lead was imported')}
					icon="ri-database-2-line">
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
						{metadataRows.map((row) => {
							const href = metadataHref(row.value)
							return (
								<div key={row.key}>
									<div className="form-label">{formatHelper.punctuateLabel(row.key)}</div>
									{href ? (
										<a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
											{row.value}
										</a>
									) : (
										<div className="break-words text-gray-900 dark:text-gray-100">{row.value}</div>
									)}
								</div>
							)
						})}
					</div>
				</LeadSectionCard>
			)}
		</div>
	)
}

export default EditLeadOverview
