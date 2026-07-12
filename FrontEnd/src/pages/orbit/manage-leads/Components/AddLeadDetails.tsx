import { FormInput, PageBreadcrumbsWithLinks, VerticalForm } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { leadService } from '@/services/LeadService'
import { userService } from '@/services/UserService'
import { InterestLevel, LeadPriority, LeadStatus, type CreateLeadRequest } from '@/types/crm/lead.types'
import type { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'

const LEAD_SOURCES = ['Website', 'Referral', 'Cold Call', 'Walk-in', 'Social Media', 'Partner', 'Other']

const AddLeadDetails: React.FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [users, setUsers] = useState<ViewUserDetailsResponse[]>([])

	useEffect(() => {
		userService.getList().then(setUsers).catch(() => setUsers([]))
	}, [])

	const onSubmit = async (formInfo: CreateLeadRequest) => {
		await runWithToast(() => leadService.create(formInfo), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				navigate(MenuLinks.EditLead.replace(':id', String(response.id)))
			},
		})
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Leads.Add_Heading', 'Create Lead')} subNames={[{ label: t('Manage.Leads_Heading', 'Leads'), link: MenuLinks.ManageLeads }, { label: t('Manage.Leads.Add.Breadcrumb', 'Create') }]} />

			<VerticalForm<CreateLeadRequest> onSubmit={onSubmit} defaultValues={{ priority: LeadPriority.Medium, leadStatus: LeadStatus.New, interestLevel: InterestLevel.Medium }}>
				<div className="space-y-6 pb-24">
					<LeadSectionCard title={t('Manage.Leads.Section_Business', 'Business Information')} subtitle={t('Manage.Leads.Section_Business_Sub', 'Tell us about the business')} icon="ri-building-2-line">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<FormInput label={t('Manage.Leads.BusinessName', 'Business Name')} required name="businessName" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.BusinessType', 'Business Type')} required name="businessType" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.CurrentPOS', 'Current POS')} name="currentPOS" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Website', 'Website')} name="website" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.GstNumber', 'GST Number')} name="gstNumber" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Pan', 'PAN')} name="pan" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.NumberOfOutlets', 'Number of Outlets')} name="numberOfOutlets" type="number" className="form-input" />
							<FormInput label={t('Manage.Leads.ExpectedMonthlyBilling', 'Expected Monthly Billing')} name="expectedMonthlyBilling" type="number" className="form-input" />
							<FormInput label={t('Manage.Leads.ExpectedRevenue', 'Expected Revenue')} name="expectedRevenue" type="number" className="form-input" />
							<FormInput label={t('Manage.Leads.CompanySize', 'Company Size')} name="companySize" type="text" className="form-input" />
						</div>
					</LeadSectionCard>

					<LeadSectionCard title={t('Manage.Leads.Section_Contact', 'Contact Person')} subtitle={t('Manage.Leads.Section_Contact_Sub', 'Primary decision maker')} icon="ri-user-3-line">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<FormInput label={t('Manage.Leads.OwnerName', 'Owner Name')} required name="ownerName" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Designation', 'Designation')} name="designation" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Mobile', 'Mobile')} required name="mobile" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.WhatsApp', 'WhatsApp')} name="whatsApp" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Email', 'Email')} name="email" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.AlternatePhone', 'Alternate Phone')} name="alternatePhone" type="text" className="form-input" />
						</div>
					</LeadSectionCard>

					<LeadSectionCard title={t('Manage.Leads.Section_Address', 'Address')} subtitle={t('Manage.Leads.Section_Address_Sub', 'Business location')} icon="ri-map-pin-line">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<FormInput label={t('Manage.Leads.Country', 'Country')} name="country" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.State', 'State')} name="state" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.City', 'City')} name="city" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Area', 'Area')} name="area" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.Pincode', 'Pincode')} name="pincode" type="text" className="form-input" />
							<FormInput label={t('Manage.Leads.FullAddress', 'Full Address')} name="fullAddress" type="textarea" className="form-input md:col-span-2" />
							<FormInput label={t('Manage.Leads.GoogleMapsLink', 'Google Maps Link')} name="googleMapsLink" type="text" className="form-input md:col-span-2" />
						</div>
					</LeadSectionCard>

					<LeadSectionCard title={t('Manage.Leads.Section_Sales', 'Sales Information')} subtitle={t('Manage.Leads.Section_Sales_Sub', 'Pipeline and ownership')} icon="ri-line-chart-line">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<FormInput label={t('Manage.Leads.LeadSource', 'Lead Source')} required name="leadSource" type="bottom-sheet" className="form-select">
								<option value="">{t('Common.Select', 'Select')}</option>
								{LEAD_SOURCES.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</FormInput>
							<FormInput label={t('Manage.Leads.AssignedTo', 'Assigned Sales Person')} required name="assignedToUserId" type="bottom-sheet" className="form-select">
								<option value="">{t('Common.Select', 'Select')}</option>
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email}
									</option>
								))}
							</FormInput>
							<FormInput label={t('Manage.Leads.Priority', 'Priority')} name="priority" type="bottom-sheet" className="form-select">
								{Object.values(LeadPriority)
									.filter((v) => typeof v === 'number')
									.map((opt) => (
										<option key={opt} value={opt}>
											{formatHelper.punctuateLabel(LeadPriority[opt as number])}
										</option>
									))}
							</FormInput>
							<FormInput label={t('Manage.Leads.LeadStatus', 'Lead Status')} name="leadStatus" type="bottom-sheet" className="form-select">
								{Object.values(LeadStatus)
									.filter((v) => typeof v === 'number')
									.map((opt) => (
										<option key={opt} value={opt}>
											{formatHelper.punctuateLabel(LeadStatus[opt as number])}
										</option>
									))}
							</FormInput>
							<FormInput label={t('Manage.Leads.ExpectedClosingDate', 'Expected Closing Date')} name="expectedClosingDate" type="date" className="form-input" />
							<FormInput label={t('Manage.Leads.InterestLevel', 'Interest Level')} name="interestLevel" type="bottom-sheet" className="form-select">
								{Object.values(InterestLevel)
									.filter((v) => typeof v === 'number')
									.map((opt) => (
										<option key={opt} value={opt}>
											{formatHelper.punctuateLabel(InterestLevel[opt as number])}
										</option>
									))}
							</FormInput>
						</div>
					</LeadSectionCard>

					<LeadSectionCard title={t('Manage.Leads.Section_Additional', 'Additional Information')} subtitle={t('Manage.Leads.Section_Additional_Sub', 'Context for your sales team')} icon="ri-file-text-line">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<FormInput label={t('Manage.Leads.Notes', 'Notes')} name="notes" type="textarea" className="form-input md:col-span-2" />
							<FormInput label={t('Manage.Leads.PainPoints', 'Pain Points')} name="painPoints" type="textarea" className="form-input" />
							<FormInput label={t('Manage.Leads.Competitors', 'Competitors')} name="competitors" type="textarea" className="form-input" />
							<FormInput label={t('Manage.Leads.Requirements', 'Requirements')} name="requirements" type="textarea" className="form-input md:col-span-2" />
						</div>
						<div className={`mt-4 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-600`}>
							<i className="ri-attachment-2 mr-2" />
							{t('Manage.Leads.AttachmentsPlaceholder', 'Attachments can be added in a future release.')}
						</div>
					</LeadSectionCard>
				</div>

				<div className={`fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95`}>
					<div className="mx-auto flex max-w-6xl justify-end gap-3">
						<button type="button" className="btn btn-secondary" onClick={() => navigate(MenuLinks.ManageLeads)}>
							{t('Common.Cancel', 'Cancel')}
						</button>
						<button type="submit" className="btn btn-primary">
							{t('Manage.Leads.Save', 'Save Lead')}
						</button>
					</div>
				</div>
			</VerticalForm>
		</>
	)
}

export default AddLeadDetails
