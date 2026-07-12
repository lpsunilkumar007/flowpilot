import React from 'react'
import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateCountryRequest } from '@/helpers/api/WebApiClient'
import { localizationService } from '@/services/LocalizationService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'

interface AddCountryProps {
	onClose: () => void
	onAdded: () => void
}

const AddCountry: React.FC<AddCountryProps> = ({ onClose, onAdded }) => {
	const { t } = useTranslation()

	const onSubmit = async (formData: CreateCountryRequest) => {
		await runWithToast(() => localizationService.createCountry(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				onAdded()
			},
		})
	}

	return (
		<PopupWrapper variant="compact">
			<PopupHeader title={t('Manage.Languages.Add_AddCountry', 'Add Country')} onClose={onClose} />

			<VerticalForm onSubmit={onSubmit}>
				<PopupBody>
					<div className="grid lg:grid-cols-1 gap-6">
						<FormInput label={t('Manage.Languages.Add_CountryName', 'Country Name')} labelClassName="form-label" containerClass="form-field" name="countryName" type="text" required className="form-input" />
						<FormInput label={t('Manage.Languages.Add_CountryCode', 'Country Code')} labelClassName="form-label" containerClass="form-field" name="countryCode" type="text" required className="form-input" />
						<FormInput label={t('Manage.Languages.Add_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" name="displayOrder" type="text" required className="form-input" />
					</div>
				</PopupBody>
				<PopupFooter>
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t('Manage.Languages.Add_Close', 'Close')}
					</button>
					<button className="btn btn-primary">{t('Manage.Languages.Add_Save', 'Save')}</button>
				</PopupFooter>
			</VerticalForm>
		</PopupWrapper>
	)
}

export default AddCountry
