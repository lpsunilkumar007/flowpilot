import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { CreateUserRequest, DropDownItemResponse, NexusLookUpCodeTypes, UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import useObjectState from '@/hooks/useObjectState'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { userService } from '@/services/UserService'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

interface AddUserProps {
	addNewUserOutPut: (isAdded: boolean) => void
}

type ModalState = {
	timeZone: DropDownItemResponse[]
	managers: UserDropDownItemResponse[]
	loading: boolean
}

const AddUser: React.FC<AddUserProps> = (props) => {
	const { t } = useTranslation()
	const loadingIndicator = () => <AnimationSkeleton />
	const {
		state: modalState,
		setKey: setModalKey,
		set,
	} = useObjectState<ModalState>({
		timeZone: [],
		managers: [],
		loading: true,
	})

	const schemaResolver = yupResolver(
		yup.object().shape({
			firstName: yup.string().trim().required('This field cannot be left empty'),
			lastName: yup.string().trim().required('This field cannot be left empty'),
			email: yup.string().trim().required('This field cannot be left empty').email('Please enter a valid email address'),
			password: yup.string().required('This field cannot be left empty'),
			confirmPassword: yup
				.string()
				.required('This field cannot be left empty')
				.oneOf([yup.ref('password')], 'Passwords must match'),
			timeZone: yup.string().required('Please select a value'),
		})
	)

	const onSubmit = async (formData: CreateUserRequest) => {
		const payload = {
			...formData,
			reportsToUserId: formData.reportsToUserId || undefined,
		}
		await runWithToast(() => userService.create(payload as CreateUserRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message!)
				props.addNewUserOutPut(true)
			},
		})
	}

	const onPageLoad = async () => {
		try {
			const [userTimeZone, managers] = await Promise.all([DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone), DropDownService.getSystemUsers(false)])
			set({
				timeZone: userTimeZone,
				managers,
				loading: false,
			})
		} catch {
			setModalKey('loading', false)
		}
	}

	useEffect(() => {
		void onPageLoad()
	}, [])

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Users.Add_AddNew', 'Add New User')} onClose={() => props.addNewUserOutPut(false)} />
				{modalState.loading && loadingIndicator()}
				{!modalState.loading && (
					<VerticalForm<CreateUserRequest> onSubmit={onSubmit} resolver={schemaResolver as any}>
						<PopupBody>
							<div className="grid lg:grid-cols-2 gap-6">
								<FormInput label={t('Manage.Users.Add_FirstName', 'First Name')} labelClassName="form-label" containerClass="form-field" type="text" name="firstName" className="form-input" key="firstName" />
								<FormInput label={t('Manage.Users.Add_LastName', 'Last Name')} labelClassName="form-label" containerClass="form-field" type="text" name="lastName" className="form-input" key="lastName" />
								<FormInput label={t('Manage.Users.Add_EmailAddress', 'Email Address')} labelClassName="form-label" containerClass="form-field" type="text" name="email" className="form-input" key="email" />
								<FormInput label={t('Manage.Users.Add_PhoneNumber', 'Phone Number')} labelClassName="form-label" containerClass="form-field" type="number" name="phoneNumber" className="form-input" key="phoneNumber" />
								<FormInput label={t('Manage.Users.Add_Password', 'Password')} labelClassName="form-label" containerClass="form-field" type="password" name="password" className="form-input" key="password" />
								<FormInput label={t('Manage.Users.Add_ConfirmPassword', 'Confirm Password')} labelClassName="form-label" containerClass="form-field" type="password" name="confirmPassword" className="form-input" key="confirmPassword" />

								<FormInput className="form-select" label={t('Manage.Users.Add_UserTimeZone', 'Time Zone')} labelClassName="form-label" containerClass="form-field" name="timeZone" type="bottom-sheet">
									<option value="">{t('Manage.Users.Add.Placeholder_Choose', 'Choose')}</option>
									{modalState.timeZone.map((item, index) => (
										<option key={index} className="dark:bg-gray-700" value={item.text}>
											{item.text}
										</option>
									))}
								</FormInput>

								<FormInput className="form-select" label={t('Manage.Users.Add_ReportsTo', 'Reports To')} labelClassName="form-label" containerClass="form-field" name="reportsToUserId" type="bottom-sheet">
									<option value="">{t('Manage.Users.ReportsTo_None', 'No manager')}</option>
									{modalState.managers.map((item) => (
										<option key={item.strValue} className="dark:bg-gray-700" value={item.strValue}>
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
