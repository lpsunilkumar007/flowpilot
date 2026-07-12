import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { FormPageFieldTypes, GetFormPageFieldModelsRequest, SearchFormPageTabRequest, ViewFormPageTabDetailResponse } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface SelectFieldTypeProps {
	formPageId: number
	onActionClick: (id: number, action: string) => void
}
const SelectFieldType: React.FC<SelectFieldTypeProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState<boolean>(false)
	const [tabDetailResponse, setTabDetailResponse] = useState<ViewFormPageTabDetailResponse[]>([])

	const onSubmit = async (formInfo: GetFormPageFieldModelsRequest) => {
		formInfo.fkFormPagePKId = props.formPageId
		await runWithToast(
			async () => {
				if (formInfo.formPageFieldType === FormPageFieldTypes.Number) {
					const response = await formDesignerService.getNumberFormFieldDetailPOST(formInfo as GetFormPageFieldModelsRequest)
					if (response) {
						await formDesignerService.createUpdateNumberFormFieldDetail(0, response)
					}
				} else if (formInfo.formPageFieldType === FormPageFieldTypes.Select) {
					const response = await formDesignerService.getSelectFormFieldDetailPOST(formInfo as GetFormPageFieldModelsRequest)
					if (response) {
						await formDesignerService.createUpdateSelectFormFieldDetail(0, response)
					}
				}
			},
			{
				onSuccess: () => messageHelper.showSuccess('Field Created Successfully!'),
			}
		)
	}

	const fetchData = async (tabPageNumber: number) => {
		setLoading(true)
		try {
			const request = new SearchFormPageTabRequest({
				fkFormPagePKId: props.formPageId,
				pageNumber: tabPageNumber,
				pageSize: 300,
			})
			request.fkFormPagePKId = props.formPageId
			const response = await formDesignerService.getFormPageTabs(request)
			if (response.data) setTabDetailResponse(response.data)
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		fetchData(0)
	}, [])
	return (
		<PopupWrapper variant="form-tabs">
			<PopupHeader title={t('Manage.Fields.Heading', 'Select Field Type')} onClose={() => props.onActionClick(0, 'CloseManageFields')} />
			{loading && <AnimationSkeleton />}
			{!loading && (
				<VerticalForm<GetFormPageFieldModelsRequest> onSubmit={onSubmit}>
					<PopupBody>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormInput label={t('Manage.Field.Select_Tab', 'Select Tab')} labelClassName="form-label" containerClass="form-field" name="fkFormPageFieldTabId" type="bottom-sheet" className="form-select">
								<option value="">{t('Manage.Field.DD_SelectTab', 'Select Tab')}</option>
								{tabDetailResponse.map((x) => (
									<option key={x.id} value={x.id}>
										{x.name}
									</option>
								))}
							</FormInput>

							<FormInput label={t('Manage.Field.Select_Field_Type', 'Select Field Type')} labelClassName="form-label" containerClass="form-field" name="formPageFieldType" type="bottom-sheet" className="form-select">
								<option value="">{t('Manage.Field.DD_SelectFieldType', 'Select Field Type')}</option>
								{Object.values(FormPageFieldTypes).map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(opt)}
									</option>
								))}
							</FormInput>
						</div>
					</PopupBody>

					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.onActionClick(0, 'CloseManageFields')}>
							{t('Manage.Fields.Create_Close', 'Close')}
						</button>
						<button type="submit" className="btn btn-primary">
							{t('Manage.Fields.Create_Create', 'Create')}
						</button>
					</PopupFooter>
				</VerticalForm>
			)}
		</PopupWrapper>
	)
}

export default SelectFieldType
