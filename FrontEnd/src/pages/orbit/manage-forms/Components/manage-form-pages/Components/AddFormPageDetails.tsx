import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateFormPageRequest } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface AddFormPageProps {
	formStructureId: number
	onActionClick: (id: number, action: string) => void
}
const AddFormPageDetails: React.FC<AddFormPageProps> = (props) => {
	const { t } = useTranslation()
	const onSubmit = async (formInfo: CreateFormPageRequest) => {
		formInfo.fkFormStructurePKId = props.formStructureId
		formInfo.displayOrder = Number(formInfo.displayOrder) ? formInfo.displayOrder : 0
		await runWithToast(() => formDesignerService.createFormPage(formInfo as CreateFormPageRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				props.onActionClick(0, 'CloseAddModal')
				props.onActionClick(response.id, 'NewFormPageAdded')
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Form.FormPages.Add_AddNew', 'Add Form Page')} onClose={() => props.onActionClick(0, 'CloseAddModal')} />
				<VerticalForm<CreateFormPageRequest> onSubmit={onSubmit}>
					<PopupBody>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormInput label={t('Manage.Form.FormPages.Add_Title', 'Title')} labelClassName="form-label" containerClass="form-field" name="title" type="text" className="form-input" />
							<FormInput label={t('Manage.Form.FormPages.Add_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" name="displayOrder" type="number" className="form-input" />
							<FormInput label={t('Manage.Form.FormPages.Add_Description', 'Description')} labelClassName="form-label" containerClass="form-field" name="description" type="textarea" className="form-input" />
							<FormInput label={t('Manage.Form.FormPages.Add_IntroText', 'Introduction Text')} labelClassName="form-label" containerClass="form-field" name="introText" type="textarea" className="form-input" />
						</div>
					</PopupBody>

					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.onActionClick(0, 'CloseAddModal')}>
							{t('Manage.Form.FormPages.Add_Close', 'Close')}
						</button>
						<button type="submit" className="btn btn-primary">
							{t('Manage.Form.FormPages.Add_Save', 'Save')}
						</button>
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		</>
	)
}

export default AddFormPageDetails
