import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { DropDownItemResponse, NexusLookUpCodeTypes, UpdateUserDetailsRequest, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { userService } from '@/services/UserService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useObjectState from '@/hooks/useObjectState'

interface EditUserProps {
	editUserOutPut: (isAdded: boolean) => void
	id: string
}

type ModalState = {
	timeZone: DropDownItemResponse[]
	loading: boolean
}

const EditUser: React.FC<EditUserProps> = (props) => {
	const { t } = useTranslation()
	const { state: modalState, setKey: setModalKey } = useObjectState<ModalState>({
		timeZone: [],
		loading: true,
	})
	const [userDetail, setUserDetail] = useState<ViewUserDetailsResponse>()
	const { userHasPermission } = usePermission()
	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		const fetchData = async () => {
			await fetchUser()
		}
		fetchData()
	}, [props.id])

	const fetchUser = async () => {
		try {
			const userTimeZone = await DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone)
			setModalKey('timeZone', userTimeZone)

			const response = await userService.getById(props.id)
			setUserDetail(response)
		} finally {
			setModalKey('loading', false)
		}
	}

	const onSubmit = async (formData: UpdateUserDetailsRequest) => {
		formData.userId = props.id
		await runWithToast(() => userService.updateUser(props.id, formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response!)
				props.editUserOutPut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Users.Edit_EditDetails', 'Edit User')} onClose={() => props.editUserOutPut(false)} />
				{modalState.loading && loadingIndicator()}
				{!modalState.loading && (
					<VerticalForm<UpdateUserDetailsRequest> onSubmit={onSubmit} defaultValues={userDetail}>
						<PopupBody>
							<div className="grid lg:grid-cols-2 gap-6">
								<FormInput label={t('Manage.Users.Edit_FirstName', 'First Name')} labelClassName="form-label" containerClass="form-field" type="text" name="firstName" className="form-input" key="firstName" />
								<FormInput label={t('Manage.Users.Edit_LastName', 'Last Name')} labelClassName="form-label" containerClass="form-field" type="text" name="lastName" className="form-input" key="lastName" />
								<FormInput label={t('Manage.Users.Edit_PhoneNumber', 'Phone Number')} labelClassName="form-label" containerClass="form-field" type="number" name="phoneNumber" className="form-input" key="phoneNumber" />
								<FormInput className="form-select" label={t('Manage.Users.Edit_UserTimeZone', 'Time Zone')} labelClassName="form-label" containerClass="form-field" name="timeZone" type="bottom-sheet">
									<option value="">{t('Manage.Users.Edit.Placeholder_Choose', 'Choose')}</option>
									{modalState.timeZone.map((item, index) => (
										<option key={index} className="dark:bg-gray-700" value={item.text}>
											{item.text}
										</option>
									))}
								</FormInput>
								<FormInput label={t('Manage.Users.Edit_CanLogin', 'Can Login')} labelClassName="form-label" containerClass="form-field" type="checkbox" name="isActive" className="form-checkbox" key="isActive" />
							</div>
						</PopupBody>
						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.editUserOutPut(false)}>
								{t('Manage.Users.Edit_Close', 'Close')}
							</button>
							{(userHasPermission(PermissionTypes.Permissions_Users_Update) || userHasPermission(PermissionTypes.Permissions_Tenants_Update)) && <button className="btn btn-primary">{t('Manage.Users.Edit_Update', 'Update')}</button>}
						</PopupFooter>
					</VerticalForm>
				)}
			</PopupWrapper>
		</>
	)
}

export default EditUser
