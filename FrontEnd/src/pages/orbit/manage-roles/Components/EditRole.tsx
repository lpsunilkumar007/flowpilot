import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { CreateOrUpdateRoleRequest, RoleDto } from '@/helpers/api/WebApiClient'
import { roleService } from '@/services/RoleService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface EditRoleProps {
	editRoleOutPut: (isAdded: boolean) => void
	id: string
}

const EditRole: React.FC<EditRoleProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [roleDetail, setRoleDetail] = useState<RoleDto>()
	const { userHasPermission } = usePermission()
	const loadingIndicator = () => <AnimationSkeleton />
	const schemaResolver = yupResolver(
		yup.object().shape({
			name: yup.string().trim().required('This field cannot be left empty'),
		})
	)

	useEffect(() => {
		const fetchData = async () => {
			await fetchRole()
		}
		fetchData()
	}, [props.id])

	const fetchRole = async () => {
		try {
			const response = await roleService.getById(props.id)
			setRoleDetail(response)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (formData: CreateOrUpdateRoleRequest) => {
		formData.id = props.id
		await runWithToast(() => roleService.registerRole(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response!)
				props.editRoleOutPut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Role.Edit_EditDetails', 'Edit Role')} onClose={() => props.editRoleOutPut(false)} />
				{loading && loadingIndicator()}
				{!loading && (
					<VerticalForm<CreateOrUpdateRoleRequest> onSubmit={onSubmit} resolver={schemaResolver as any} defaultValues={roleDetail}>
						<PopupBody>
							<div className="grid lg:grid-cols-1 gap-6">
								<FormInput label={t('Manage.Role.Edit_RoleName', 'Role Name')} labelClassName="form-label" containerClass="form-field" type="text" name="name" className="form-input" key="name" required />
								<FormInput label={t('Manage.Role.Edit_RoleDescription', 'Role Description')} labelClassName="form-label" containerClass="form-field" type="textarea" name="description" className="form-input" key="description" />
							</div>
						</PopupBody>
						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.editRoleOutPut(false)}>
								{t('Manage.Role.Edit_Close', 'Close')}
							</button>
							{userHasPermission(PermissionTypes.Permissions_Roles_Update) && <button className="btn btn-primary">{t('Manage.Role.Edit_Update', 'Update')}</button>}
						</PopupFooter>
					</VerticalForm>
				)}
			</PopupWrapper>
		</>
	)
}

export default EditRole
