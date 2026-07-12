import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { UpdateFormPageRequest } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useObjectState from '@/hooks/useObjectState'

interface EditFormPageProps {
	id: number
	onActionClick: (id: number, action: string) => void
}
type ModalState = {
	loading: boolean
}
const EditFormPageDetails: React.FC<EditFormPageProps> = (props) => {
	const { t } = useTranslation()
	const [formInfo, setFormInfo] = useState<UpdateFormPageRequest>()
	const { state: modelState, setKey: setModalKey } = useObjectState<ModalState>({
		loading: false,
	})

	const onSubmit = async (formInfo: UpdateFormPageRequest) => {
		formInfo.displayOrder = Number(formInfo.displayOrder) ? formInfo.displayOrder : 0
		await runWithToast(() => formDesignerService.updateFormPage(formInfo), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.onActionClick(formInfo.id, 'FormPageEdit')
			},
		})
	}

	const fetchPageById = async () => {
		setModalKey('loading', true)
		try {
			const response = await formDesignerService.getFormPageById(props.id)
			setFormInfo({
				id: response.id,
				title: response.title,
				description: response.description,
				introText: response.introText,
				displayOrder: response.displayOrder,
			} as UpdateFormPageRequest)
		} catch (error) {
			messageHelper.showErrorResult(error)
		} finally {
			setModalKey('loading', false)
		}
	}

	useEffect(() => {
		if (props.id) fetchPageById()
	}, [props.id])

	return (
		<PopupWrapper variant="default">
			{modelState.loading && <AnimationSkeleton />}

			{!modelState.loading && formInfo && (
				<>
					<PopupHeader title={t('Manage.Form.FormPages.Edit_EditFormPage', 'Edit Form Page')} onClose={() => props.onActionClick(0, 'CloseEditModal')} />

					<VerticalForm<UpdateFormPageRequest> onSubmit={onSubmit} defaultValues={formInfo}>
						<PopupBody>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormInput label={t('Manage.Form.FormPages.Edit_Title', 'Title')} labelClassName="form-label" containerClass="form-field" required name="title" type="text" className="form-input" />
								<FormInput label={t('Manage.Form.FormPages.Edit_DisplayOrder', 'Display Order')} labelClassName="form-label" containerClass="form-field" required name="displayOrder" type="number" className="form-input" />
								<FormInput label={t('Manage.Form.FormPages.Add_Description', 'Description')} labelClassName="form-label" containerClass="form-field" name="description" type="textarea" className="form-input" />
								<FormInput label={t('Manage.Form.FormPages.Add_IntroText', 'Introduction Text')} labelClassName="form-label" containerClass="form-field" name="introText" type="textarea" className="form-input" />
							</div>
						</PopupBody>

						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.onActionClick(0, 'CloseEditModal')}>
								{t('Manage.Form.FormPages.Edit_Close', 'Close')}
							</button>
							<button type="submit" className="btn btn-primary">
								{t('Manage.Form.FormPages.Edit_Update', 'Update')}
							</button>
						</PopupFooter>
					</VerticalForm>
				</>
			)}
		</PopupWrapper>
	)
}

export default EditFormPageDetails
