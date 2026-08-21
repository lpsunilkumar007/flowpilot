import { FormInput, VerticalForm } from '@/components'
import { DropDownItemResponse, NexusLookUpCodeTypes, UpdateUserRequest, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { personalService } from '@/services/PersonalService'
import { messageHelper } from '@/helpers/message.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import avatar from '@/assets/images/users/avatar-11.png'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { AuthActionTypes } from '@/redux/auth/constants'
import { fetchUserProfileSuccess } from '@/redux/actions'
import { DropDownService } from '@/services/DropDownService'
import { useTranslation } from 'react-i18next'
import useObjectState from '@/hooks/useObjectState'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { FileUploader } from '@/components'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

type ModalState = {
	timeZone: DropDownItemResponse[]
	loading: boolean
}

const EditUserProfile = () => {
	const { t } = useTranslation()
	const { state: modalState, setKey: setModalKey } = useObjectState<ModalState>({
		timeZone: [],
		loading: true,
	})
	const dispatch = useDispatch<AppDispatch>()
	// For tracking loading state

	const [viewUserDetailsResponse, setViewUserDetailsResponse] = useState<ViewUserDetailsResponse>()

	// Loading indicator
	const loadingIndicator = () => <AnimationSkeleton />

	const fetchProfileData = async () => {
		await runWithToast(
			async () => {
				const userTimeZone = await DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone)
				setModalKey('timeZone', userTimeZone)

				const profileDetails: ViewUserDetailsResponse = await personalService.getProfile()
				setViewUserDetailsResponse(profileDetails)

				return profileDetails
			},
			{ setLoading: (loading) => setModalKey('loading', loading) }
		)
	}

	const schemaResolver = yupResolver(
		yup.object().shape({
			firstName: yup.string().trim().required('This field cannot be left empty'),
			lastName: yup.string().trim().required('This field cannot be left empty'),
			timeZone: yup.string().required('Please select a value'),
		})
	)

	const onSubmit = async (formData: UpdateUserRequest) => {
		const modifiedFormData = { ...formData }
		modifiedFormData.deleteCurrentImage = !!formData.image

		await runWithToast(() => personalService.updateProfile(modifiedFormData as UpdateUserRequest), {
			onSuccess: async (response) => {
				messageHelper.showSuccess(response as string)
				dispatch(fetchUserProfileSuccess(AuthActionTypes.FETCH_USER_PROFILE, await personalService.getProfile())as any)

				if (formData.image) {
					await fetchProfileData()
				}
			},
		})
	}

	const imageUrl = viewUserDetailsResponse?.imageUrl ? `data:image/png;base64, ${viewUserDetailsResponse.imageUrl}` : avatar

	useEffect(() => {
		const getProfile = async () => {
			await fetchProfileData()
		}

		getProfile()
	}, [])

	if (modalState.loading) {
		return <div>{loadingIndicator()}</div> // Show your loading component here
	}

	return (
		<>
			<div className="card p-6 mb-6">
				<h4 className="card-title mb-1">
					{t('Manage.Profile.Edit_EditProfile', 'Edit Profile')} {viewUserDetailsResponse && `(${viewUserDetailsResponse.email})`}
				</h4>
				{viewUserDetailsResponse && (
					<VerticalForm<UpdateUserRequest> onSubmit={onSubmit} resolver={schemaResolver as any} defaultValues={viewUserDetailsResponse}>
						<div className="flex flex-col md:flex-row items-center gap-8 my-2 p-6 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50">
							<div className="relative group">
								<div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl">
									<img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
								</div>
							</div>

							<div className="flex-1 w-full">
								<FileUploader name="image" text={t('Manage.Profile.Drop_Instruction', 'Click to upload or drag and drop')} extraText={t('Manage.Profile.Drop_Hint', 'SVG, PNG, JPG or GIF (max. 4MB)')} accept={{ 'image/*': [] }} maxFiles={1} isMulti={false} />
							</div>
						</div>

						<div className="grid lg:grid-cols-2 gap-4 pt-3">
							<FormInput label={t('Manage.Profile.Edit_FirstName', 'First Name')} labelClassName="form-label" containerClass="form-field" type="text" name="firstName" className="form-input" key="firstName" />
							<FormInput label={t('Manage.Profile.Edit_LastName', 'Last Name')} labelClassName="form-label" containerClass="form-field" type="text" name="lastName" className="form-input" key="lastName" />
							<FormInput label={t('Manage.Profile.Edit_PhoneNumber', 'Phone Number')} labelClassName="form-label" containerClass="form-field" type="number" name="phoneNumber" className="form-input" key="phoneNumber" />

							<FormInput className="form-select" labelClassName="form-label" label={t('Manage.Profile.Edit_TimeZone', 'Time Zone')} name="timeZone" type="bottom-sheet">
								<option value="">Choose...</option>
								{modalState.timeZone.map((item, index) => (
									<option key={index} className="dark:bg-gray-700" value={item.text}>
										{item.text}
									</option>
								))}
							</FormInput>
						</div>

						<button className="btn btn-primary mt-6 w-full" type="submit">
							{t('Manage.Profile.Edit_UpdateProfile', 'Update Profile')}
						</button>
					</VerticalForm>
				)}
			</div>
		</>
	)
}

export default EditUserProfile
