import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateNexusLookUpCodeValueRequest } from '@/helpers/api/WebApiClient'
import { nexusLookUpService } from '@/services/NexusLookUpService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface AddNexusLookUpCodeValueProps {
	addNewLookUpCodeValueOutPut: (refreshGrid: boolean, closePopup: boolean) => void
	lookUpCodeId: number
}

const AddNexusLookUpCodeValue: React.FC<AddNexusLookUpCodeValueProps> = (props) => {
	const { t } = useTranslation()
	const schemaResolver = yupResolver(
		yup.object().shape({
			lookUpValue: yup.string().trim().required('This field cannot be left empty'),
			displayOrder: yup.number().typeError('This field cannot be left empty').required('This field cannot be left empty'),
		})
	)
	const onSubmit = async (formData: CreateNexusLookUpCodeValueRequest, resetForm: () => void) => {
		if (!Number(formData.displayOrder)) {
			formData.displayOrder = 0
		}
		formData.lookUpCodeId = props.lookUpCodeId
		await runWithToast(() => nexusLookUpService.createLookUpCodeValue('1', formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.addNewLookUpCodeValueOutPut(true, false)
				resetForm()
			},
		})
	}
	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Nexus.Values.Add_AddNew', 'Add New')} onClose={() => props.addNewLookUpCodeValueOutPut(false, true)} />
				<VerticalForm<CreateNexusLookUpCodeValueRequest> onSubmit={(data: CreateNexusLookUpCodeValueRequest, { reset }: { reset: () => void }) => onSubmit(data, reset)} resolver={schemaResolver as any}>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6">
							<FormInput label={t('Manage.Nexus.Values.Add_Value', 'Value')} labelClassName="form-label" containerClass="form-field" required type="text" name="lookUpValue" className="form-input" key="lookUpValue" />
							<FormInput label={t('Manage.Nexus.Values.Add_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" required type="number" name="displayOrder" className="form-input" key="displayOrder" />
							<FormInput label={t('Manage.Nexus.Values.Add_IsActive', 'Is Active')} labelClassName="form-label" containerClass="form-field" type="checkbox" defaultChecked={true} name="isActive" className="form-checkbox" key="isActive" />
							<FormInput label={t('Manage.Nexus.Values.Add_IsDefault', 'Is Default')} labelClassName="form-label" containerClass="form-field" type="checkbox" defaultChecked={false} name="isDefault" className="form-checkbox" key="isDefault" />
						</div>
					</PopupBody>
					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.addNewLookUpCodeValueOutPut(false, true)}>
							{t('Manage.Nexus.Values.Add_Close', 'Close')}
						</button>
						<button className="btn btn-primary">{t('Manage.Nexus.Values.Add_Save', 'Save')}</button>
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		</>
	)
}
export default AddNexusLookUpCodeValue
