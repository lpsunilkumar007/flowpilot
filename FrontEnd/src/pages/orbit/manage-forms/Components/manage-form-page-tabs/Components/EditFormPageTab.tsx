import { FormInput } from '@/components'
import VerticalForm from '@/components/VerticalForm'
import { SearchFormPageTabRequest, UpdateFormPageTabRequest, ViewFormPageTabDetailResponse } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface EditFormPageProps {
	formPageTabId: number
	formPagePkId: number
	onActionClick: (id: number, action: string) => void
}

const EditFormPageTab: React.FC<EditFormPageProps> = (props) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [formInfo, setFromInfo] = useState<UpdateFormPageTabRequest>()
	const [tabDetailResponse, setTabDetailResponse] = useState<ViewFormPageTabDetailResponse[]>([])
	const { t } = useTranslation()
	const fetchData = async (formPageTabId: number) => {
		setLoading(true)
		try {
			const response = await formDesignerService.getFormPageTabById(formPageTabId)
			setFromInfo({
				name: response.name,
				displayOrder: response.displayOrder,
				id: response.id,
				fkFormPageTabPKId: response.fkFormPageTabPKId,
			} as UpdateFormPageTabRequest)
		} catch (error) {
			messageHelper.showErrorResult(error)
		} finally {
			setLoading(false)
		}
	}
	const onSubmit = async (formData: UpdateFormPageTabRequest) => {
		formData.displayOrder = Number(formData.displayOrder) ? formData.displayOrder : 0
		formData.fkFormPageTabPKId = Number(formData.fkFormPageTabPKId) ? formData.fkFormPageTabPKId : undefined
		await runWithToast(() => formDesignerService.updateFormPageTab(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.onActionClick(formData.id, 'EditCompleted')
			},
		})
	}

	const fetchTabData = async (tabPageNumber: number) => {
		setLoading(true)
		try {
			const request = new SearchFormPageTabRequest({
				fkFormPagePKId: props.formPagePkId,
				pageNumber: tabPageNumber,
				pageSize: 300,
			})
			request.fkFormPagePKId = props.formPagePkId
			const response = await formDesignerService.getFormPageTabs(request)
			if (response.data) {
				setTabDetailResponse(response.data.filter((x) => x.id != props.formPageTabId))
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const fetchFormData = async () => {
			await fetchData(props.formPageTabId)
			await fetchTabData(0)
		}
		fetchFormData()
	}, [props.formPageTabId])
	return (
		<>
			{loading && <AnimationSkeleton />}
			{!loading && formInfo && (
				<>
					<VerticalForm<UpdateFormPageTabRequest> onSubmit={onSubmit} defaultValues={formInfo}>
						<div className="p-6 overflow-y-auto">
							<div className="grid  grid-cols-1 md:grid-cols-3 gap-6 pt-5">
								<FormInput label={t('Manage.FormPage.Tabs.Edit_Name', 'Name')} name="name" type="text" className="form-input" />
								<FormInput label={t('Manage.FormPage.Tabs.Edit_DisplayOrder', 'Display Order')} name="displayOrder" type="number" className="form-input" />
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
							<button type="button" className="btn btn-secondary" onClick={() => props.onActionClick(0, 'CancelEditAction')}>
								{t('Manage.FormPage.Tabs.Cancel_Btn', 'Cancel')}
							</button>
							<button type="submit" className="btn btn-primary">
								{t('Manage.FormPage.Tabs.Update_Btn', 'Update')}
							</button>
						</div>
					</VerticalForm>
				</>
			)}
		</>
	)
}

export default EditFormPageTab
