import { FormInput, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { FormStatus, UpdateFormStructureRequest } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface EditFormDetailProps {
	id: number
}

type ModalState = {
	loading: boolean
	formStructureId: number
}
const EditFormDetail: React.FC<EditFormDetailProps> = (props) => {
	const [formInfo, setFormInfo] = useState<UpdateFormStructureRequest>(new UpdateFormStructureRequest())
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		loading: true,
		formStructureId: 0,
	})

	const onSubmit = async (formValues: UpdateFormStructureRequest) => {
		formValues.id = props.id
		formValues.formStatus = formValues.formStatus.length === 0 ? ('-1' as unknown as FormStatus) : formValues.formStatus
		await runWithToast(() => formDesignerService.updateFormStructure(formValues), {
			onSuccess: (response) => messageHelper.showSuccess(response),
		})
	}

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const fetchForm = async () => {
		assignValueToModal('loading', true)

		try {
			const response = await formDesignerService.getFormStructureById(props.id)
			setFormInfo({
				id: response.id,
				name: response.name,
				description: response.description,
				formStatus: response.formStatus,
				introductionText: response.introductionText,
			} as UpdateFormStructureRequest)
		} catch (error) {
			messageHelper.showErrorResult(error)
		} finally {
			assignValueToModal('loading', false)
		}
	}

	useEffect(() => {
		if (props.id) {
			fetchForm()
		}
	}, [props.id])

	return (
		<>
			<PopupWrapper variant="form-tabs">
				{modalState.loading && <AnimationSkeleton />}
				{!modalState.loading && formInfo && (
					<>
						<div className="grid lg:grid-cols-1 px-6 py-2 gap-6 pt-5">
							<VerticalForm<UpdateFormStructureRequest> onSubmit={onSubmit} defaultValues={formInfo}>
								<div className="p-4 overflow-y-auto">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
										<FormInput label={t('Manage.Forms.Edit_Name', 'Name')} labelClassName="form-label" containerClass="form-field" required name="name" type="text" className="form-input" />
										<FormInput label={t('Manage.Forms.Edit_FormStatus', 'Form Status')} labelClassName="form-label" containerClass="form-field" name="formStatus" type="bottom-sheet" className="form-select">
											<option value="">{t('Manage.Form.Edit.DD_SelectStatus', 'Select Status')}</option>
											{Object.values(FormStatus).map((opt) => (
												<option key={opt} value={opt}>
													{formatHelper.punctuateLabel(opt)}
												</option>
											))}
										</FormInput>
										<FormInput label={t('Manage.Forms.Edit_Description', 'Description')} labelClassName="form-label" containerClass="form-field" name="description" type="textarea" className="form-input" />

										<FormInput label={t('Manage.Forms.Edit_IntroductionText', 'Introduction Text')} labelClassName="form-label" containerClass="form-field" name="introductionText" type="textarea" className="form-input" />
									</div>
								</div>

								<div className="flex justify-end items-center gap-2 p-4">
									{userHasPermission(PermissionTypes.Permissions_ManageForm_Update) && (
										<button type="submit" className="btn btn-primary">
											{t('Manage.Forms.Edit_UpdateBtn', 'Update')}
										</button>
									)}
								</div>
							</VerticalForm>
						</div>
					</>
				)}
			</PopupWrapper>
		</>
	)
}

export default EditFormDetail
