import React, { useEffect, useState } from 'react'
import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { UpdateCountryRequest } from '@/helpers/api/WebApiClient'
import { localizationService } from '@/services/LocalizationService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface EditCountryProps {
	id: number
	onClose: () => void
	onUpdated: () => void
}

const EditCountry: React.FC<EditCountryProps> = ({ id, onClose, onUpdated }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [loading, setLoading] = useState(true)
	const [countryDetail, setCountryDetail] = useState<any>(null)
	const loadingIndicator = () => <AnimationSkeleton />
	const schemaResolver = yupResolver(
		yup.object().shape({
			countryName: yup.string().trim().required('This field cannot be left empty'),
			countryCode: yup.string().trim().required('This field cannot be left empty'),
			displayOrder: yup.mixed().required('This field cannot be left empty'),
		})
	)
	const fetchCountry = async () => {
		try {
			setLoading(true)
			const response = await localizationService.getCountryById(id)
			setCountryDetail(response)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (formData: UpdateCountryRequest) => {
		await runWithToast(() => localizationService.updateCountry({ ...formData } as UpdateCountryRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				onUpdated()
			},
		})
	}

	useEffect(() => {
		fetchCountry()
	}, [id])

	return (
		<PopupWrapper variant="edit-country">
			<PopupHeader title={t('Manage.Languages.Edit_EditDetails', 'Edit Details')} onClose={onClose} />

			{loading && loadingIndicator()}
			{!loading && countryDetail && (
				<VerticalForm onSubmit={onSubmit} resolver={schemaResolver as any} defaultValues={countryDetail}>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6">
							<FormInput label={t('Manage.Languages.Edit_CountryName', 'Country Name')} labelClassName="form-label" containerClass="form-field" name="countryName" type="text" required className="form-input" key="countryName" />
							<FormInput label={t('Manage.Languages.Edit_CountryCode', 'Country Code')} labelClassName="form-label" containerClass="form-field" name="countryCode" type="text" required className="form-input" key="countryCode" />
							<FormInput label={t('Manage.Languages.Edit_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" name="displayOrder" type="text" required className="form-input" key="displayOrder" />
						</div>
					</PopupBody>

					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							{t('Manage.Languages.Edit_Close', 'Close')}
						</button>
						{userHasPermission(PermissionTypes.Permissions_CountryLocalization_Update) && <button className="btn btn-primary">{t('Manage.Languages.Edit_Update', 'Update')}</button>}
					</PopupFooter>
				</VerticalForm>
			)}
		</PopupWrapper>
	)
}

export default EditCountry
