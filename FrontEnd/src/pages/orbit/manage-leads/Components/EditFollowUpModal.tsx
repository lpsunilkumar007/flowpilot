import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { leadService } from '@/services/LeadService'
import { FollowUpType, type UpdateLeadFollowUpRequest, type ViewLeadFollowUpResponse } from '@/types/crm/lead.types'
import { yupResolver } from '@hookform/resolvers/yup'
import moment from 'moment'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

interface EditFollowUpModalProps {
	leadId: number
	followUp: ViewLeadFollowUpResponse
	onClose: (saved: boolean) => void
}

type EditFollowUpFormValues = {
	nextFollowUpDate: string
	followUpType: string
	reminderNote: string
}

const toFollowUpTypeValue = (type: FollowUpType | string) => {
	if (typeof type === 'string') return String(FollowUpType[type as keyof typeof FollowUpType] ?? FollowUpType.Call)
	return String(type)
}

const EditFollowUpModal: React.FC<EditFollowUpModalProps> = ({ leadId, followUp, onClose }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [saving, setSaving] = useState(false)
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageLeads_Update)
		|| userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_Update)

	const schemaResolver = yupResolver(
		yup.object().shape({
			nextFollowUpDate: yup.string().required(t('Validation.Required', 'This field cannot be left empty')),
			followUpType: yup.string().required(t('Validation.Required', 'This field cannot be left empty')),
			
		})
	)

	const onSubmit = async (formData: EditFollowUpFormValues) => {
		if (saving) return

		const payload: UpdateLeadFollowUpRequest = {
			nextFollowUpDate: formData.nextFollowUpDate,
			followUpType: formData.followUpType,
			reminderNote: formData.reminderNote?.trim() || undefined,
		}

		await runWithToast(() => leadService.updateFollowUp(leadId, followUp.id, payload), {
			setLoading: setSaving,
			onSuccess: (response) => {
				messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Leads.FollowUp_Updated', 'Follow-up updated successfully'))
				onClose(true)
			},
		})
	}

	return (
		<PopupWrapper variant="default">
			<PopupHeader title={t('Manage.Leads.EditFollowUp_Title', 'Edit Follow-up')} onClose={() => !saving && onClose(false)} />
			<VerticalForm<any>
				onSubmit={onSubmit}
				resolver={schemaResolver}
				defaultValues={{
					nextFollowUpDate: moment(followUp.nextFollowUpDate).format('YYYY-MM-DD'),
					followUpType: toFollowUpTypeValue(followUp.followUpType),
					reminderNote: followUp.reminderNote ?? '',
				}}
			>
				<PopupBody>
					<div className="grid gap-6">
						<FormInput label={t('Manage.Leads.NextFollowUpDate', 'Next Follow-up Date')} labelClassName="form-label" containerClass="form-field" name="nextFollowUpDate" type="date" required className="form-input" key="nextFollowUpDate" />
						<FormInput label={t('Manage.Leads.FollowUpType', 'Follow-up Type')} labelClassName="form-label" containerClass="form-field" name="followUpType" type="bottom-sheet" required className="form-select" key="followUpType">
							{Object.values(FollowUpType)
								.filter((v) => typeof v === 'number')
								.map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(FollowUpType[opt as number])}
									</option>
								))}
						</FormInput>
						<FormInput label={t('Manage.Leads.ReminderNote', 'Notes')} labelClassName="form-label" containerClass="form-field" name="reminderNote" type="textarea" className="form-textarea-tall" key="reminderNote" />
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

export default EditFollowUpModal
