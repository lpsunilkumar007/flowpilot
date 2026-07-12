import { FormInput, PageBreadcrumbsWithLinks, VerticalForm } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { CreateFormStructureRequest, FormStatus } from '@/helpers/api/WebApiClient'
import { formDesignerService } from '@/services/FormDesignerService'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const AddFormDetails: React.FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const onSubmit = async (formInfo: CreateFormStructureRequest) => {
		formInfo.formStatus = formInfo.formStatus.length === 0 ? ('-1' as unknown as FormStatus) : formInfo.formStatus
		await runWithToast(() => formDesignerService.createFormStructure(formInfo as CreateFormStructureRequest), {
			onSuccess: (response) => {
				if (response) {
					messageHelper.showSuccess(response.message)
					navigate(MenuLinks.EditFormLandingPage.replace(':id', response.id.toString()))
				}
			},
		})
	}
	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Forms.Add_Heading', 'Add Form')} subNames={[{ label: t('Manage.Forms_Heading', 'Forms'), link: MenuLinks.ManageForms }, { label: t('Manage.Forms.Add.BreadCrumb', 'Add') }]} />
			<div className="card">
				<VerticalForm<CreateFormStructureRequest> onSubmit={onSubmit}>
					<div className="p-4 overflow-y-auto">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
							<FormInput label={t('Manage.Forms.Add_Name', 'Name')} required name="name" type="text" className="form-input" />
							<FormInput label={t('Manage.Forms.Add_FormStatus', 'Form Status')} name="formStatus" type="bottom-sheet" className="form-select">
								<option value="">{t('Manage.Form.Add.DD_SelectStatus', 'Select Status')}</option>
								{Object.values(FormStatus).map((opt) => (
									<option key={opt} value={opt}>
										{formatHelper.punctuateLabel(opt)}
									</option>
								))}
							</FormInput>
							<FormInput label={t('Manage.Forms.Add_Description', 'Description')} name="description" type="textarea" className="form-input" />

							<FormInput label={t('Manage.Forms.Add_IntroductionText', 'Introduction Text')} name="introductionText" type="textarea" className="form-input" />
						</div>
					</div>

					<div className="flex justify-end items-center gap-2 p-4 border-t dark:border-slate-600">
						<button type="submit" className="btn btn-primary">
							{t('Manage.Forms.Add_SaveBtn', 'Save')}
						</button>
					</div>
				</VerticalForm>
			</div>
		</>
	)
}

export default AddFormDetails
