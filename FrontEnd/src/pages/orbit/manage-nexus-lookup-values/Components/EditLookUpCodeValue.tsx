import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { UpdateNexusLookUpCodeValueRequest, ViewNexusLookUpCodeValuesResponse } from '@/helpers/api/WebApiClient'
import { nexusLookUpService } from '@/services/NexusLookUpService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface EditNexusLookUpCodeValueProps {
	editLookUpCodeValueOutPut: (isAdded: boolean) => void
	id: number
}

const EditLookUpCodeValue: React.FC<EditNexusLookUpCodeValueProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [lookUpCodeValueDetail, setLookUpCodeValueDetail] = useState<ViewNexusLookUpCodeValuesResponse>()
	const { userHasPermission } = usePermission()
	const loadingIndicator = () => <AnimationSkeleton />
	const schemaResolver = yupResolver(
		yup.object().shape({
			lookUpValue: yup.string().trim().required('This field cannot be left empty'),
			displayOrder: yup.number().typeError('This field cannot be left empty').required('This field cannot be left empty'),
		})
	)

	useEffect(() => {
		const fetchData = async () => {
			await fetchLookUpCodeValue()
		}
		fetchData()
	}, [props.id])

	const fetchLookUpCodeValue = async () => {
		try {
			const response = await nexusLookUpService.getLookUpCodeValueById(props.id, '1')
			setLookUpCodeValueDetail(response)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (formData: UpdateNexusLookUpCodeValueRequest) => {
		formData.id = props.id
		if (!Number(formData.displayOrder)) {
			formData.displayOrder = 0
		}
		await runWithToast(() => nexusLookUpService.updateLookUpCodeValue('1', formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response!)
				props.editLookUpCodeValueOutPut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Nexus.Values.Edit_EditDetails', 'Edit Details')} onClose={() => props.editLookUpCodeValueOutPut(false)} />
				{loading && loadingIndicator()}
				{!loading && (
					<VerticalForm<UpdateNexusLookUpCodeValueRequest> onSubmit={onSubmit} resolver={schemaResolver as any} defaultValues={lookUpCodeValueDetail}>
						<PopupBody>
							<div className="grid lg:grid-cols-1 gap-6">
								<FormInput label={t('Manage.Nexus.Values.Edit_Value', 'Value')} labelClassName="form-label" containerClass="form-field" required type="text" name="lookUpValue" className="form-input" key="lookUpValue" />
								<FormInput label={t('Manage.Nexus.Values.Edit_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" required type="number" name="displayOrder" className="form-input" key="displayOrder" />
								<FormInput label={t('Manage.Nexus.Values.Edit_IsActive', 'Is Active')} labelClassName="form-label" containerClass="form-field" type="checkbox" name="isActive" className="form-checkbox" key="isActive" />
								<FormInput label={t('Manage.Nexus.Values.Edit_IsDefault', 'Is Default')} labelClassName="form-label" containerClass="form-field" type="checkbox" defaultChecked={false} name="isDefault" className="form-checkbox" key="isDefault" />
							</div>
						</PopupBody>
						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.editLookUpCodeValueOutPut(false)}>
								{t('Manage.Nexus.Values.Edit_Close', 'Close')}
							</button>
							{userHasPermission(PermissionTypes.Permissions_ManageNexusLookUps_Update) && <button className="btn btn-primary">{t('Manage.Nexus.Values.Edit_Update', 'Update')}</button>}
						</PopupFooter>
					</VerticalForm>
				)}
			</PopupWrapper>
		</>
	)
}
export default EditLookUpCodeValue
