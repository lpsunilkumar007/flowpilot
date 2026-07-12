import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import { AuthContainer, AuthLayout } from '@/components/AuthPageLayout'
import { MenuLinks } from '@/constants/menu'
import { ResetForgotPasswordRequest } from '@/helpers/api/WebApiClient'
import { getQueryStringValue, useQueryString } from '@/helpers/query.string.helper'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword, resetAuth } from '@/redux/actions'
import { AppDispatch, RootState } from '@/redux/store'

const RecoverPassword = () => {
	const dispatch = useDispatch<AppDispatch>()
	const navigate = useNavigate()
	const query = useQueryString()
	const passwordReset = useSelector((state: RootState) => state.Auth.passwordReset)

	const BottomLink = () => {
		return (
			<div className="text-center my-4">
				<p className="text-muted">
					Back to{' '}
					<Link to={MenuLinks.Login} className="text-muted ms-1 link-offset-3 underline underline-offset-4">
						<b>Log In</b>
					</Link>
				</p>
			</div>
		)
	}

	useEffect(() => {
		dispatch(resetAuth()as any)
	}, [dispatch])

	useEffect(() => {
		const token = getQueryStringValue('Token', query)
		if (!token) {
			navigate(MenuLinks.Login)
		}
	}, [navigate, query])

	useEffect(() => {
		if (passwordReset) {
			navigate(MenuLinks.Login)
		}
	}, [passwordReset, navigate])

	const onSubmit = (formData: ResetForgotPasswordRequest) => {
		formData.token = getQueryStringValue('Token', query)!
		dispatch(resetPassword(formData)as any)
	}

	return (
		<>
			<PageBreadcrumb title="Recover Password" />
			<AuthContainer>
				<AuthLayout authTitle="Reset Your Password" helpText="Please enter your email address, new password, and confirm the password to reset your account. Ensure that your password meets security requirements." bottomLinks={<BottomLink />}>
					<VerticalForm<ResetForgotPasswordRequest> onSubmit={onSubmit}>
						<FormInput label="Email address" type="text" name="email" placeholder="Enter your email" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" required />
						<FormInput label="Password" type="password" name="password" placeholder="Enter your password" className="form-input rounded-e-none" containerClass="form-field-auth" labelClassName="form-label-auth" labelContainerClassName="flex justify-between items-center mb-2" required />
						<FormInput label="Confirm Password" type="password" name="confirmPassword" placeholder="Enter your password" className="form-input rounded-e-none" containerClass="form-field-auth" labelClassName="form-label-auth" labelContainerClassName="flex justify-between items-center mb-2" required />

						<div className="text-center mb-6">
							<button className="btn bg-primary text-white" type="submit">
								<i className="ri-login-box-line me-1"></i> Reset Password
							</button>
						</div>
					</VerticalForm>
				</AuthLayout>
			</AuthContainer>
		</>
	)
}

export default RecoverPassword
