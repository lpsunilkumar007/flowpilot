import React, { useEffect, useState } from 'react'
import { VerticalForm, FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import { UpdateCountryLocalizationRequest } from '@/helpers/api/WebApiClient'
import { localizationService } from '@/services/LocalizationService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface Props {
	id: number
	onClose: () => void
	onUpdated: () => void
}

const EditLocalization: React.FC<Props> = ({ id, onClose, onUpdated }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [loading, setLoading] = useState(true)
	const [detail, setDetail] = useState<any>(null)
	const schemaResolver = yupResolver(
		yup.object().shape({
			key: yup.string().trim().required('This field cannot be left empty'),
			value: yup.string().trim().required('This field cannot be left empty'),
		})
	)

	const fetchDetail = async () => {
		try {
			setLoading(true)
			const res = await localizationService.getCountryLocalizationById(id)
			setDetail(res)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (formData: UpdateCountryLocalizationRequest) => {
		await runWithToast(() => localizationService.updateCountryLocalization({ ...formData } as UpdateCountryLocalizationRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				onUpdated()
			},
		})
	}

	useEffect(() => {
		fetchDetail()
	}, [id])

	return (
		<PopupWrapper variant="compact">
			<PopupHeader title={t('Manage.Localization.Edit_Title', 'Edit Localization')} onClose={onClose} />

			{loading && <AnimationSkeleton />}
			{!loading && detail && (
				<VerticalForm onSubmit={onSubmit} resolver={schemaResolver as any} defaultValues={detail}>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6 ">
							<FormInput label={t('Manage.Localization.Edit_Key', 'Key')} labelClassName="form-label" containerClass="form-field" name="key" disabled type="text" required className="form-input" key="key" />
							<FormInput label={t('Manage.Localization.Edit_Value', 'Value')} labelClassName="form-label" containerClass="form-field" name="value" type="text" required className="form-input" key="value" />
						</div>
					</PopupBody>

					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							{t('Manage.Localization.Edit_Close', 'Close')}
						</button>
						{userHasPermission(PermissionTypes.Permissions_CountryLocalization_Update) && <button className="btn btn-primary">{t('Manage.Localization.Edit_Update', 'Update')}</button>}
					</PopupFooter>
				</VerticalForm>
			)}
		</PopupWrapper>
	)
}

export default EditLocalization
