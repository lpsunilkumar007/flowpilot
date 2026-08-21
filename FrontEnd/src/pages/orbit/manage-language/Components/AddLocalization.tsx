import React from 'react'
import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateCountryLocalizationRequest } from '@/helpers/api/WebApiClient'
import { localizationService } from '@/services/LocalizationService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface AddLocalizationProps {
	countryId: number
	onClose: () => void
	onAdded: () => void
}

const AddLocalization: React.FC<AddLocalizationProps> = ({ countryId, onClose, onAdded }) => {
	const { t } = useTranslation()
	const schemaResolver = yupResolver(
		yup.object().shape({
			key: yup.string().trim().required('This field cannot be left empty'),
			value: yup.string().trim().required('This field cannot be left empty'),
		})
	)

	const onSubmit = async (formData: CreateCountryLocalizationRequest) => {
		const payload = new CreateCountryLocalizationRequest()
		payload.fkCountryId = countryId
		payload.key = formData.key
		payload.value = formData.value
		await runWithToast(() => localizationService.createCountryLocalization(payload), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				onAdded()
			},
		})
	}

	return (
		<PopupWrapper variant="compact">
			<PopupHeader title={t('Manage.Localization.Add_AddLocalization', 'Add Localization')} onClose={onClose} />
			<VerticalForm<CreateCountryLocalizationRequest> onSubmit={onSubmit} resolver={schemaResolver as any}>
				<PopupBody>
					<div className="grid lg:grid-cols-1 gap-6">
						<FormInput label={t('Manage.Localization.Add_Key', 'Key')} labelClassName="form-label" containerClass="form-field" name="key" type="text" required className="form-input" />
						<FormInput label={t('Manage.Localization.Add_Value', 'Value')} labelClassName="form-label" containerClass="form-field" name="value" type="text" required className="form-input" />
					</div>
				</PopupBody>

				<PopupFooter>
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t('Manage.Localization.Add_Close', 'Close')}
					</button>

					<button className="btn btn-primary">{t('Manage.Localization.Add_Save', 'Save')}</button>
				</PopupFooter>
			</VerticalForm>
		</PopupWrapper>
	)
}

export default AddLocalization
