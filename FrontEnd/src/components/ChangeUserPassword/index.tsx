import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { ChangePasswordForcefullyRequest, ChangePasswordRequest } from '@/helpers/api/WebApiClient'
import { personalService } from '@/services/PersonalService'
import { userService } from '@/services/UserService'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

export interface ChangeUserPasswordProps {
	/** When provided, admin flow (change password for another user). When omitted, self flow (change own password). */
	userId?: string
	/** For admin flow: callback when modal should close */
	onUserActionClick?: (isChanged: boolean) => void
	/** 'popup' for modal (admin), 'inline' for card layout (profile) */
	variant?: 'popup' | 'inline'
}

const ChangeUserPassword: React.FC<ChangeUserPasswordProps> = (props) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const isAdminMode = !!props.userId
	const variant = props.variant ?? (isAdminMode ? 'popup' : 'inline')
	const passwordMatchResolver = yupResolver(
		yup.object().shape({
			newPassword: yup.string().required('This field cannot be left empty'),
			confirmNewPassword: yup
				.string()
				.required('This field cannot be left empty')
				.oneOf([yup.ref('newPassword')], 'Passwords must match'),
		})
	)
	const selfPasswordResolver = yupResolver(
		yup.object().shape({
			password: yup.string().required('This field cannot be left empty'),
			newPassword: yup.string().required('This field cannot be left empty'),
			confirmNewPassword: yup
				.string()
				.required('This field cannot be left empty')
				.oneOf([yup.ref('newPassword')], 'Passwords must match'),
		})
	)

	const handleAdminSubmit = async (formData: ChangePasswordForcefullyRequest) => {
		await runWithToast(() => userService.changePasswordForcefully(props.userId!, formData), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.onUserActionClick?.(false)
			},
		})
	}

	const handleSelfSubmit = async (formData: ChangePasswordRequest) => {
		await runWithToast(() => personalService.changePassword(formData), {
			onSuccess: (response) => messageHelper.showSuccess(response),
		})
	}

	if (isAdminMode && variant === 'popup') {
		return (
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.User.ChangeUserPassword_Heading', 'Change User Password')} onClose={() => props.onUserActionClick?.(false)} />
				<VerticalForm<ChangePasswordForcefullyRequest> onSubmit={handleAdminSubmit} resolver={passwordMatchResolver as any}>
					<PopupBody>
						<div className="grid lg:grid-cols-2 gap-6">
							<FormInput label={t('Manage.User.ChangeUserPassword.New_Password', 'New Password')} labelClassName="form-label" containerClass="form-field" type="password" name="newPassword" className="form-input" key="newPassword" />
							<FormInput label={t('Manage.User.ChangeUserPassword.Confirm_Password', 'Confirm Password')} labelClassName="form-label" containerClass="form-field" type="password" name="confirmNewPassword" className="form-input" key="confirmNewPassword" />
						</div>
					</PopupBody>
					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.onUserActionClick?.(false)}>
							{t('Manage.User.ChangeUserPassword_Close', 'Close')}
						</button>
						{userHasPermission(PermissionTypes.Permissions_Users_Update) || userHasPermission(PermissionTypes.Permissions_Tenants_Update) ? (
							<button className="btn btn-primary" type="submit">
								{t('Manage.User.ChangeUserPassword_Save', 'Save')}
							</button>
						) : null}
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		)
	}

	return (
		<div className="card p-6 mb-6">
			<h4 className="card-title mb-1">{t('Manage.Profile.Edit_ChangePassword', 'Change Password')}</h4>
			<VerticalForm<ChangePasswordRequest> onSubmit={handleSelfSubmit} resolver={selfPasswordResolver as any}>
				<div className="grid lg:grid-cols-1 gap-6 pt-5">
					<FormInput label={t('Manage.Profile.Edit_OldPassword', 'Old Password')} labelClassName="form-label" containerClass="form-field" type="password" name="password" placeholder={t('Manage.Profile.Edit.Placeholder_OldPassword', 'Old Password')} className="form-input" key="password" />
					<FormInput label={t('Manage.Profile.Edit_NewPassword', 'New Password')} labelClassName="form-label" containerClass="form-field" type="password" name="newPassword" placeholder={t('Manage.Profile.Edit.Placeholder_NewPassword', 'New Password')} className="form-input" key="newPassword" />
					<FormInput label={t('Manage.Profile.Edit_ConfirmPassword', 'Confirm Password')} labelClassName="form-label" containerClass="form-field" type="password" name="confirmNewPassword" placeholder={t('Manage.Profile.Edit.Placeholder_ConfirmPassword', 'Confirm Password')} className="form-input" key="confirmNewPassword" />
					<button className="btn btn-primary w-full mt-5" type="submit">
						{t('Manage.Profile.Edit_BtnChangePassword', 'Change Password')}
					</button>
				</div>
			</VerticalForm>
		</div>
	)
}

export default ChangeUserPassword
