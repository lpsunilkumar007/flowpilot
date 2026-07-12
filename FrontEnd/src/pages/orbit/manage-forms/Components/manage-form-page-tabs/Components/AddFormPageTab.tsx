import FormInput from '@/components/FormInput'
import VerticalForm from '@/components/VerticalForm'
import { PermissionTypes } from '@/constants/permissions'
import { CreateFormPageTabRequest, SearchFormPageTabRequest, ViewFormPageTabDetailResponse } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface AddFormPageProps {
	formPagePkId: number
	onActionClick: (id: number, action: string) => void
	reloadFormPageTabs: boolean
}
const AddFormPageTab: React.FC<AddFormPageProps> = (props) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [loading, setLoading] = useState<boolean>(false)
	const [tabDetailResponse, setTabDetailResponse] = useState<ViewFormPageTabDetailResponse[]>([])
	const onSubmit = async (formInfo: CreateFormPageTabRequest, { reset }: { reset: () => void }) => {
		formInfo.fkFormPagePKId = props.formPagePkId
		formInfo.displayOrder = Number(formInfo.displayOrder) ? formInfo.displayOrder : 0
		formInfo.fkFormPageTabPKId = Number(formInfo.fkFormPageTabPKId) ? formInfo.fkFormPageTabPKId : undefined
		await runWithToast(() => formDesignerService.createFormPageTab(formInfo as CreateFormPageTabRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				reset()
				props.onActionClick(response.id, 'NewTabAdded')
			},
		})
	}
	const fetchData = async (tabPageNumber: number) => {
		setLoading(true)
		try {
			const request = new SearchFormPageTabRequest({
				fkFormPagePKId: props.formPagePkId,
				pageNumber: tabPageNumber,
				pageSize: 300,
			})
			request.fkFormPagePKId = props.formPagePkId
			const response = await formDesignerService.getFormPageTabs(request)
			if (response.data) setTabDetailResponse(response.data)
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		fetchData(0)
	}, [props.reloadFormPageTabs])

	return (
		<>
			{loading && <AnimationSkeleton />}
			{!loading && (
				<VerticalForm<CreateFormPageTabRequest> onSubmit={onSubmit}>
					<div className="p-6 overflow-y-auto">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
							<FormInput label={t('Manage.FormPage.Tabs.Add_Name', 'Name')} required name="name" type="text" className="form-input" />
							<FormInput label={t('Manage.FormPage.Tabs.Add_DisplayOrder', 'Display Order')} required name="displayOrder" type="number" className="form-input" />
							<FormInput label={t('Manage.FormPage.Tabs.Add_ParentTab', 'Parent Tab')} name="fkFormPageTabPKId" type="bottom-sheet" className="form-select">
								<option value="">{t('Manage.FormPage.Tabs.DD_SelectParentTab', 'Select Parent Tab')}</option>
								{tabDetailResponse.map((x) => (
									<option key={x.id} value={x.id}>
										{x.name}
									</option>
								))}
							</FormInput>
						</div>
					</div>

					<div className="flex justify-end items-center gap-2 px-6  dark:border-slate-600">
						{userHasPermission(PermissionTypes.Permissions_ManageLookUps_Create) && (
							<button type="submit" className="btn btn-primary">
								{t('Manage.FormPage.Tabs.Save_Btn', 'Save')}
							</button>
						)}
					</div>
				</VerticalForm>
			)}
		</>
	)
}

export default AddFormPageTab
