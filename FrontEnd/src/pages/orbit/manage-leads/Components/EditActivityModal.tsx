import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { leadService } from '@/services/LeadService'
import { LeadActivityType, type UpdateLeadActivityRequest, type ViewLeadActivityResponse } from '@/types/crm/lead.types'
import { yupResolver } from '@hookform/resolvers/yup'
import moment from 'moment'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

interface EditActivityModalProps {
	leadId: number
	activity: ViewLeadActivityResponse
	onClose: (saved: boolean) => void
}

type EditActivityFormValues = {
	activityType: string
	activityDate: string
	durationMinutes: string
	outcome: string
	notes: string
	nextFollowUpDate: string
}

const toActivityTypeValue = (type: LeadActivityType | string) => {
	if (typeof type === 'string') return String(LeadActivityType[type as keyof typeof LeadActivityType] ?? LeadActivityType.Call)
	return String(type)
}

const toDateInput = (value?: string) => (value ? moment(value).format('YYYY-MM-DD') : '')

const EditActivityModal: React.FC<EditActivityModalProps> = ({ leadId, activity, onClose }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [saving, setSaving] = useState(false)
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageLeadActivities_Update)

	const schemaResolver = yupResolver(
		yup.object().shape({
			activityType: yup.string().required(t('Validation.Required', 'This field cannot be left empty')),
			activityDate: yup.string().required(t('Validation.Required', 'This field cannot be left empty')),
		})
	)

	const onSubmit = async (formData: EditActivityFormValues) => {
		if (saving) return

		const payload: UpdateLeadActivityRequest = {
			activityType: formData.activityType,
			activityDate: formData.activityDate,
			durationMinutes: formData.durationMinutes === '' ? undefined : Number(formData.durationMinutes),
			outcome: formData.outcome?.trim() || undefined,
			notes: formData.notes?.trim() || undefined,
			nextFollowUpDate: formData.nextFollowUpDate || undefined,
		}

		await runWithToast(() => leadService.updateActivity(leadId, activity.id, payload), {
			setLoading: setSaving,
			onSuccess: (response) => {
				messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Leads.Activity_Updated', 'Activity updated successfully'))
				onClose(true)
			},
		})
	}

	return (
		<PopupWrapper variant="default">
			<PopupHeader title={t('Manage.Leads.EditActivity_Title', 'Edit Activity')} onClose={() => !saving && onClose(false)} />
			<VerticalForm<any>
				onSubmit={onSubmit}
				resolver={schemaResolver}
				defaultValues={{
					activityType: toActivityTypeValue(activity.activityType),
					activityDate: toDateInput(activity.activityDate),
					durationMinutes: activity.durationMinutes != null ? String(activity.durationMinutes) : '',
					outcome: activity.outcome ?? '',
					notes: activity.notes ?? '',
					nextFollowUpDate: toDateInput(activity.nextFollowUpDate),
				}}
			>
				<PopupBody>
					<div className="grid gap-4 md:grid-cols-2">
						<FormInput label={t('Manage.Leads.ActivityType', 'Activity Type')} labelClassName="form-label" containerClass="form-field" required name="activityType" type="bottom-sheet" className="form-select" key="activityType">
							{Object.values(LeadActivityType)
								.filter((v) => typeof v === 'number')
								.map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(LeadActivityType[opt as number])}
									</option>
								))}
						</FormInput>
						<FormInput label={t('Manage.Leads.ActivityDate', 'Activity Date')} labelClassName="form-label" containerClass="form-field" required name="activityDate" type="date" className="form-input" key="activityDate" />
						<FormInput label={t('Manage.Leads.Duration', 'Duration (mins)')} labelClassName="form-label" containerClass="form-field" name="durationMinutes" type="number" className="form-input" key="durationMinutes" />
						<FormInput label={t('Manage.Leads.Outcome', 'Outcome')} labelClassName="form-label" containerClass="form-field" name="outcome" type="text" className="form-input" key="outcome" />
						<FormInput label={t('Manage.Leads.NextFollowUpDate', 'Next Follow-up Date')} labelClassName="form-label" containerClass="form-field" name="nextFollowUpDate" type="date" className="form-input md:col-span-2" key="nextFollowUpDate" />
						<FormInput label={t('Manage.Leads.Notes', 'Notes')} labelClassName="form-label" containerClass="form-field" name="notes" type="textarea" className="form-input md:col-span-2" key="notes" />
					</div>
				</PopupBody>
				<PopupFooter>
					<button className="btn btn-secondary" type="button" onClick={() => onClose(false)} disabled={saving}>
						{t('Common.Close', 'Close')}
					</button>
					{canUpdate && (
						<button className="btn btn-primary" type="submit" disabled={saving}>
							{saving ? t('Common.Saving', 'Saving...') : t('Common.Save', 'Save')}
						</button>
					)}
				</PopupFooter>
			</VerticalForm>
		</PopupWrapper>
	)
}

export default EditActivityModal
