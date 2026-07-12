import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { UpdateLookUpCodeValueRequest, ViewLookUpCodeValuesResponse } from '@/helpers/api/WebApiClient'
import { lookUpService } from '@/services/LookUpService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface EditLookUpCodeValueProps {
	editLookUpCodeValueOutPut: (isAdded: boolean) => void
	id: number
}

const EditLookUpCodeValue: React.FC<EditLookUpCodeValueProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [lookUpCodeValueDetail, setLookUpCodeValueDetail] = useState<ViewLookUpCodeValuesResponse>()
	const { userHasPermission } = usePermission()
	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		const fetchData = async () => {
			await fetchLookUpCodeValue()
		}
		fetchData()
	}, [props.id])

	const fetchLookUpCodeValue = async () => {
		try {
			const response = await lookUpService.getLookUpCodeValueById(props.id)
			setLookUpCodeValueDetail(response)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (formData: UpdateLookUpCodeValueRequest) => {
		formData.id = props.id
		if (!Number(formData.displayOrder)) {
			formData.displayOrder = 0
		}
		await runWithToast(() => lookUpService.updateLookUpCodeValue(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response!)
				props.editLookUpCodeValueOutPut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Values.Edit_EditDetails', 'Edit Details')} onClose={() => props.editLookUpCodeValueOutPut(false)} />
				{loading && loadingIndicator()}
				{!loading && (
					<VerticalForm<UpdateLookUpCodeValueRequest> onSubmit={onSubmit} defaultValues={lookUpCodeValueDetail}>
						<PopupBody>
							<div className="grid lg:grid-cols-1 gap-6">
								<FormInput label={t('Manage.Values.Edit_Value', 'Value')} labelClassName="form-label" containerClass="form-field" required type="text" name="lookUpValue" className="form-input" key="lookUpValue" />
								<FormInput label={t('Manage.Values.Edit_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" required type="number" name="displayOrder" className="form-input" key="displayOrder" />
								<FormInput label={t('Manage.Values.Edit_IsActive', 'Is Active')} labelClassName="form-label" containerClass="form-field" type="checkbox" name="isActive" className="form-checkbox" key="isActive" />
							</div>
						</PopupBody>
						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.editLookUpCodeValueOutPut(false)}>
								{t('Manage.Values.Edit_Close', 'Close')}
							</button>
							{userHasPermission(PermissionTypes.Permissions_ManageLookUps_Update) && <button className="btn btn-primary">{t('Manage.Values.Edit_Update', 'Update')}</button>}
						</PopupFooter>
					</VerticalForm>
				)}
			</PopupWrapper>
		</>
	)
}
export default EditLookUpCodeValue
