import React from 'react'
import { FormInput, Label, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateEmailTemplateRequest, EmailTemplateUsedFor } from '@/helpers/api/WebApiClient'
import { emailTemplateService } from '@/services/EmailTemplateService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface AddEmailTemplatesProps {
	addNewUserOutPut: (isAdded: boolean) => void
}

const AddEmailTemplates: React.FC<AddEmailTemplatesProps> = (props) => {
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
	const schemaResolver = yupResolver(
		yup.object().shape({
			name: yup.string().trim().required('This field cannot be left empty'),
			templateUsedFor: yup.mixed().required('Please select a value'),
			emailSubject: yup.string().trim().required('This field cannot be left empty'),
			emailBody: yup.string().trim().required('This field cannot be left empty'),
		})
	)
	const onSubmit = async (formData: CreateEmailTemplateRequest) => {
		const createdRequest = new CreateEmailTemplateRequest()
		createdRequest.name = formData.name
		createdRequest.description = formData.description
		createdRequest.emailBody = formData.emailBody
		createdRequest.emailSubject = formData.emailSubject
		createdRequest.templateUsedFor = formData.templateUsedFor
		createdRequest.isShared = formData.isShared
		createdRequest.templateUsedFor = createdRequest.templateUsedFor.length === 0 || createdRequest.templateUsedFor === undefined ? ('-1' as unknown as EmailTemplateUsedFor) : createdRequest.templateUsedFor

		await runWithToast(() => emailTemplateService.createEmailTemplate(createdRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				props.addNewUserOutPut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.EmailTemplates.Add_AddNew', 'Add New')} onClose={() => props.addNewUserOutPut(false)} />
				<VerticalForm<CreateEmailTemplateRequest> onSubmit={onSubmit} resolver={schemaResolver as any}>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6">
							<FormInput label={t('Manage.EmailTemplates.Add_Name', 'Name')} labelClassName="form-label" containerClass="form-field" type="text" name="name" className="form-input" key="Name" required />
							<FormInput label={t('Manage.EmailTemplates.Add_Description', 'Description')} labelClassName="form-label" containerClass="form-field" type="textarea" name="description" className="form-input" key="description" />
							<FormInput label={t('Manage.EmailTemplates.Add_TemplateUsedFor', 'Template Used For')} labelClassName="form-label" containerClass="form-field" type="bottom-sheet" name="templateUsedFor" className="form-select" key="templateUsedFor" required>
								<option value="">{t('Manage.EmailTemplates.Add.Placeholder_SelectTemplateUsedFor', 'Select Template Used For')}</option>
								{Object.keys(EmailTemplateUsedFor)
									.filter((key) => isNaN(Number(key)))
									.map((key) => (
										<option key={key} value={EmailTemplateUsedFor[key as keyof typeof EmailTemplateUsedFor]}>
											{key}
										</option>
									))}
							</FormInput>

							<FormInput label={t('Manage.EmailTemplates.Add_EmailSubject', 'Email Subject')} labelClassName="form-label" containerClass="form-field" type="text" name="emailSubject" className="form-input" key="emailSubject" required />
							<FormInput label={t('Manage.EmailTemplates.Add_EmailBody', 'Email Body')} labelClassName="form-label" containerClass="form-field" type="textarea" name="emailBody" className="form-input" key="emailBody" required />
							<FormInput type="checkbox" defaultChecked={false} name="isShared" className="form-checkbox" key="isShared" label={t('Manage.EmailTemplates.Add_IsShared', 'Is Shared')} labelClassName="form-label" containerClass="form-field" />
						</div>
					</PopupBody>
					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.addNewUserOutPut(false)}>
							{t('Manage.EmailTemplates.Add_Close', 'Close')}
						</button>
						{userHasPermission(PermissionTypes.Permissions_EmailTemplates_Create) && <button className="btn btn-primary">{t('Manage.EmailTemplates.Add_Save', 'Save')}</button>}
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		</>
	)
}

export default AddEmailTemplates
