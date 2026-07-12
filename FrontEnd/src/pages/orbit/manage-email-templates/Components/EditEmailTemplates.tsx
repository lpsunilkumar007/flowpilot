import React, { useEffect, useState } from 'react'
import { FormInput, Label, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { EmailTemplateUsedFor, UpdateEmailTemplateRequest, ViewEmailTemplateDetailResponse } from '@/helpers/api/WebApiClient'
import { emailTemplateService } from '@/services/EmailTemplateService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { usePermission } from '@/hooks/usePermission'
import { PermissionTypes } from '@/constants/permissions'
import { useTranslation } from 'react-i18next'

interface EditEmailTemplatesProps {
	editEmailTemplatePut: (isAdded: boolean) => void
	id: number
}

const EditEmailTemplates: React.FC<EditEmailTemplatesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [emailTemplateDetail, setEmailTemplateDetail] = useState<ViewEmailTemplateDetailResponse>()
	const { userHasPermission } = usePermission()
	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		const fetchData = async () => {
			await fetchEmailTemplate()
		}
		fetchData()
	}, [props.id])

	const fetchEmailTemplate = async () => {
		try {
			const response = await emailTemplateService.getEmailTemplateById(props.id)
			setEmailTemplateDetail(response)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (formData: UpdateEmailTemplateRequest) => {
		const updateRequest = new UpdateEmailTemplateRequest()
		updateRequest.id = props.id
		updateRequest.name = formData.name
		updateRequest.description = formData.description
		updateRequest.emailBody = formData.emailBody
		updateRequest.emailSubject = formData.emailSubject
		updateRequest.templateUsedFor = formData.templateUsedFor.length === 0 || formData.templateUsedFor === undefined ? ('-1' as unknown as EmailTemplateUsedFor) : formData.templateUsedFor
		// formData.templateUsedFor.length === 0 || formData.templateUsedFor === undefined ? ('-1' as unknown as EmailTemplateUsedFor) : formData.templateUsedFor

		updateRequest.isShared = formData.isShared
		await runWithToast(() => emailTemplateService.updateEmailTemplate(updateRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response!)
				props.editEmailTemplatePut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.EmailTemplates.Edit_EditDetails', 'Edit Details')} onClose={() => props.editEmailTemplatePut(false)} />
				{loading && loadingIndicator()}
				{!loading && (
					<VerticalForm<any> onSubmit={onSubmit} defaultValues={emailTemplateDetail}>
						<PopupBody>
							<div className="grid lg:grid-cols-1 gap-6">
								<FormInput label={t('Manage.EmailTemplates.Edit_Name', 'Name')} labelClassName="form-label" containerClass="form-field" type="text" name="name" className="form-input" key="name" />
								<FormInput label={t('Manage.EmailTemplates.Edit_Description', 'Description')} labelClassName="form-label" containerClass="form-field" type="textarea" name="description" className="form-input" key="description" />
								 <FormInput label={t('Manage.EmailTemplates.Edit_TemplateUsedFor', 'Template Used For')} labelClassName="form-label" containerClass="form-field" type="bottom-sheet" name="templateUsedFor" className="form-select" key="templateUsedFor">
									<option value="">{t('Manage.EmailTemplates.Edit.Placeholder_SelectTemplateUsedFor', 'Select Template Used For')}</option>
									{Object.keys(EmailTemplateUsedFor)
										.filter((key) => isNaN(Number(key)))
										.map((key) => (
											<option key={key} value={EmailTemplateUsedFor[key as keyof typeof EmailTemplateUsedFor]}>
												{key}
											</option>
										))}
								</FormInput> 
								<FormInput label={t('Manage.EmailTemplates.Edit_EmailSubject', 'Email Subject')} labelClassName="form-label" containerClass="form-field" type="text" name="emailSubject" className="form-input" key="emailSubject" />
								<FormInput label={t('Manage.EmailTemplates.Edit_EmailBody', 'Email Body')} labelClassName="form-label" containerClass="form-field" type="textarea" name="emailBody" className="form-input" key="emailBody" />
								<FormInput label={t('Manage.EmailTemplates.Edit_IsShared', 'Is Shared')} type="checkbox" name="isShared" className="form-checkbox" key="isShared" labelClassName="form-label" containerClass="form-field" />
							</div>
						</PopupBody>
						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.editEmailTemplatePut(false)}>
								{t('Manage.EmailTemplates.Edit_Close', 'Close')}
							</button>
							{userHasPermission(PermissionTypes.Permissions_EmailTemplates_Update) && <button className="btn btn-primary">{t('Manage.EmailTemplates.Edit_Update', 'Update')}</button>}
						</PopupFooter>
					</VerticalForm>
				)}
			</PopupWrapper>
		</>
	)
}

export default EditEmailTemplates
