import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateOrUpdateRoleRequest } from '@/helpers/api/WebApiClient'
import { roleService } from '@/services/RoleService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'

interface AddRoleProps {
	addNewRoleOutPut: (isAdded: boolean) => void
}

const AddRole: React.FC<AddRoleProps> = (props) => {
	const { t } = useTranslation()
	const onSubmit = async (formData: CreateOrUpdateRoleRequest) => {
		await runWithToast(() => roleService.registerRole(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.addNewRoleOutPut(true)
			},
		})
	}
	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Role_Add', 'Add Role')} onClose={() => props.addNewRoleOutPut(false)} />
				<VerticalForm<CreateOrUpdateRoleRequest> onSubmit={onSubmit}>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6">
							<FormInput label={t('Manage.Role.Add_RoleName', 'Role Name')} labelClassName="form-label" containerClass="form-field" type="text" name="name" className="form-input" key="name" />
							<FormInput label={t('Manage.Role.Add_RoleDescription', 'Role Description')} labelClassName="form-label" containerClass="form-field" type="textarea" name="description" className="form-input" key="description" />
						</div>
					</PopupBody>
					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.addNewRoleOutPut(false)}>
							{t('Manage.Role.Add_Close', 'Close')}
						</button>
						<button className="btn btn-primary">{t('Manage.Role.Add_Save', 'Save')}</button>
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		</>
	)
}

export default AddRole
