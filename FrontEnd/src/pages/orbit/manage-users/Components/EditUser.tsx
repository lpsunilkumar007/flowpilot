import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { DropDownItemResponse, NexusLookUpCodeTypes, UpdateUserDetailsRequest, UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
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
	managers: UserDropDownItemResponse[]
	loading: boolean
}

const EditUser: React.FC<EditUserProps> = (props) => {
	const { t } = useTranslation()
	const {
		state: modalState,
		setKey: setModalKey,
		set,
	} = useObjectState<ModalState>({
		timeZone: [],
		managers: [],
		loading: true,
	})
	const [userDetail, setUserDetail] = useState<UpdateUserDetailsRequest>()
	const { userHasPermission } = usePermission()
	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		void fetchUser()
	}, [props.id])

	const fetchUser = async () => {
		try {
			const [userTimeZone, managers, response] = await Promise.all([DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone), DropDownService.getSystemUsers(false), userService.getById(props.id)])

			set({
				timeZone: userTimeZone,
				managers: managers.filter((m) => m.strValue !== props.id),
				loading: false,
			})

			setUserDetail({
				userId: props.id,
				firstName: response.firstName || '',
				lastName: response.lastName || '',
				phoneNumber: response.phoneNumber,
				timeZone: response.timeZone,
				isActive: response.isActive,
				reportsToUserId: response.reportsToUserId || '',
			} as unknown as UpdateUserDetailsRequest)
		} catch {
			setModalKey('loading', false)
		}
	}

	const onSubmit = async (formData: UpdateUserDetailsRequest) => {
		formData.userId = props.id
		formData.reportsToUserId = formData.reportsToUserId || undefined
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
				{!modalState.loading && userDetail && (
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
								<FormInput className="form-select" label={t('Manage.Users.Edit_ReportsTo', 'Reports To')} labelClassName="form-label" containerClass="form-field" name="reportsToUserId" type="bottom-sheet">
									<option value="">{t('Manage.Users.ReportsTo_None', 'No manager')}</option>
									{modalState.managers.map((item) => (
										<option key={item.strValue} className="dark:bg-gray-700" value={item.strValue}>
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
