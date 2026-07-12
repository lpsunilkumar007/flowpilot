import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateUserRequest, DropDownItemResponse, NexusLookUpCodeTypes } from '@/helpers/api/WebApiClient'
import { userService } from '@/services/UserService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useObjectState from '@/hooks/useObjectState'

interface AddUserProps {
	addNewUserOutPut: (isAdded: boolean) => void
}

type ModalState = {
	timeZone: DropDownItemResponse[]
	loading: boolean
}

const AddUser: React.FC<AddUserProps> = (props) => {
	const { t } = useTranslation()
	const loadingIndicator = () => <AnimationSkeleton />
	const { state: modalState, setKey: setModalKey } = useObjectState<ModalState>({
		timeZone: [],
		loading: true,
	})

	const onSubmit = async (formData: CreateUserRequest) => {
		await runWithToast(() => userService.create(formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message!)
				props.addNewUserOutPut(true)
			},
		})
	}

	const onPageLoad = async () => {
		try {
			const userTimeZone = await DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone)
			setModalKey('timeZone', userTimeZone)
		} finally {
			setModalKey('loading', false)
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			await onPageLoad()
		}
		fetchData()
	}, [])

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Users.Add_AddNew', 'Add New User')} onClose={() => props.addNewUserOutPut(false)} />
				{modalState.loading && loadingIndicator()}
				{!modalState.loading && (
					<VerticalForm<CreateUserRequest> onSubmit={onSubmit}>
						<PopupBody>
							<div className="grid lg:grid-cols-2 gap-6">
								<FormInput label={t('Manage.Users.Add_FirstName', 'First Name')} labelClassName="form-label" containerClass="form-field" type="text" name="firstName" className="form-input" key="firstName" />
								<FormInput label={t('Manage.Users.Add_EmailAddress', 'Email Address')} labelClassName="form-label" containerClass="form-field" type="text" name="email" className="form-input" key="email" />
								<FormInput label={t('Manage.Users.Add_Password', 'Password')} labelClassName="form-label" containerClass="form-field" type="password" name="password" className="form-input" key="password" />

								<FormInput label={t('Manage.Users.Add_LastName', 'Last Name')} labelClassName="form-label" containerClass="form-field" type="text" name="lastName" className="form-input" key="lastName" />
								<FormInput label={t('Manage.Users.Add_PhoneNumber', 'Phone Number')} labelClassName="form-label" containerClass="form-field" type="number" name="phoneNumber" className="form-input" key="phoneNumber" />
								<FormInput label={t('Manage.Users.Add_ConfirmPassword', 'Confirm Password')} labelClassName="form-label" containerClass="form-field" type="password" name="confirmPassword" className="form-input" key="confirmPassword" />

								<FormInput className="form-select" label={t('Manage.Users.Add_UserTimeZone', 'Time Zone')} labelClassName="form-label" containerClass="form-field" name="timeZone" type="bottom-sheet">
									<option value="">{t('Manage.Users.Add.Placeholder_Choose', 'Choose')}</option>
									{modalState.timeZone.map((item, index) => (
										<option key={index} className="dark:bg-gray-700" value={item.text}>
											{item.text}
										</option>
									))}
								</FormInput>
							</div>
						</PopupBody>
						<PopupFooter>
							<button type="button" className="btn btn-secondary" onClick={() => props.addNewUserOutPut(false)}>
								{t('Manage.Users.Add_Close', 'Close')}
							</button>
							<button className="btn btn-primary">{t('Manage.Users.Add_Save', 'Save')}</button>
						</PopupFooter>
					</VerticalForm>
				)}
			</PopupWrapper>
		</>
	)
}

export default AddUser
