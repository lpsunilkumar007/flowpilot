import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateLookUpCodeValueRequest } from '@/helpers/api/WebApiClient'
import { lookUpService } from '@/services/LookUpService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface AddLookUpCodeValueProps {
	addNewLookUpCodeValueOutPut: (refreshGrid: boolean, closePopup: boolean) => void
	lookUpCodeId: number
}

const AddLookUpCodeValue: React.FC<AddLookUpCodeValueProps> = (props) => {
	const { t } = useTranslation()
	const schemaResolver = yupResolver(
		yup.object().shape({
			lookUpValue: yup.string().trim().required('This field cannot be left empty'),
			displayOrder: yup.number().typeError('This field cannot be left empty').required('This field cannot be left empty'),
		})
	)
	const onSubmit = async (formData: CreateLookUpCodeValueRequest) => {
		if (!Number(formData.displayOrder)) {
			formData.displayOrder = 0
		}
		formData.lookUpCodeId = props.lookUpCodeId
		await runWithToast(() => lookUpService.createLookUpCodeValue(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.addNewLookUpCodeValueOutPut(true, true)
			},
		})
	}
	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Values.Add_AddNew', 'Add New')} onClose={() => props.addNewLookUpCodeValueOutPut(false, true)} />
				<VerticalForm<CreateLookUpCodeValueRequest> onSubmit={onSubmit} resolver={schemaResolver as any}>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6">
							<FormInput label={t('Manage.Values.Add_Value', 'Value')} labelClassName="form-label" containerClass="form-field" required type="text" name="lookUpValue" className="form-input" key="lookUpValue" />
							<FormInput label={t('Manage.Values.Add_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" required type="number" name="displayOrder" className="form-input" key="displayOrder" />
							<FormInput label={t('Manage.Values.Add_IsActive', 'Is Active')} labelClassName="form-label" containerClass="form-field" type="checkbox" name="isActive" className="form-checkbox" key="isActive" />
						</div>
					</PopupBody>
					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.addNewLookUpCodeValueOutPut(false, true)}>
							{t('Manage.Values.Add_Close', 'Close')}
						</button>
						<button className="btn btn-primary">{t('Manage.Values.Add_Save', 'Save')}</button>
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		</>
	)
}
export default AddLookUpCodeValue
