import { FormInput, VerticalForm } from '@/components'
import { UpdateTenantRequest, ViewTenantResponse } from '@/helpers/api/WebApiClient'
import { multiTenantService } from '@/services/MultiTenantService'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface EditTenantDetailsProps {
	id: string
}

const EditTenantDetails: React.FC<EditTenantDetailsProps> = (props) => {
	const { t } = useTranslation()
	const [tenantDetailResponse, setTenantDetailResponse] = useState<ViewTenantResponse>()
	const [loading, setLoading] = useState<boolean>(false)
	const fetchData = async () => {
		setLoading(true)
		try {
			const response = await multiTenantService.getTenantById(Number(props.id))
			setTenantDetailResponse(response)
		} finally {
			setLoading(false)
		}
	}
	const onSubmit = async (formData: UpdateTenantRequest) => {
		formData.id = Number(props.id)
		await runWithToast(() => multiTenantService.updateTenantDetails(formData), {
			onSuccess: (response) => messageHelper.showSuccess(response),
		})
	}
	useEffect(() => {
		fetchData()
	}, [props.id])

	return (
		<>
			{loading && <AnimationSkeleton />}
			{!loading && (
				<VerticalForm<UpdateTenantRequest> defaultValues={tenantDetailResponse} onSubmit={onSubmit}>
					<div className="card overflow-hidden">
						<div className="p-4 overflow-y-auto">
							<div className="grid lg:grid-cols-2 gap-6 pt-5">
								<FormInput label={t('Manage.Tenant.Edit_Name', 'Name')} labelClassName="form-label" containerClass="form-field" type="text" name="name" className="form-input" key="name" />
								<FormInput label={t('Manage.Tenant.Edit_Email', 'Email')} labelClassName="form-label" containerClass="form-field" type="text" name="adminEmail" className="form-input" key="adminEmail" />
								<FormInput label={t('Manage.Tenant.Edit_IsActive', 'Is Active')} labelClassName="form-label" containerClass="form-field" type="checkbox" name="isActive" key="isActive" />
							</div>
						</div>
						<div className="flex justify-end items-center gap-2 p-4 border-t dark:border-slate-700">
							<button className="btn btn-primary">{t('Manage.Tenant.Edit_Update', 'Update')}</button>
						</div>
					</div>
				</VerticalForm>
			)}
		</>
	)
}

export default EditTenantDetails
