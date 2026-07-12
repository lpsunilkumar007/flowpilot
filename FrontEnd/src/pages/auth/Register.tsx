import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormInput, Label, PageBreadcrumb, VerticalForm } from '../../components'
import { Link, useNavigate } from 'react-router-dom'
//actions
import { resetAuth, signupUser } from '../../redux/actions'
import { AppDispatch, RootState } from '../../redux/store'
import AuthContainer from '../../components/AuthPageLayout/AuthContainer'
import AuthLayout from '../../components/AuthPageLayout/AuthLayout'
import { MenuLinks } from '@/constants/menu'
import { RegisterUserRequest } from '@/helpers/api/WebApiClient'
import { commonHelper } from '@/helpers/common.helper'

const BottomLink = () => {
	return (
		<div className="text-center my-4">
			<p className="text-muted">
				Already have account?{' '}
				<Link to={MenuLinks.Login} className="text-muted ms-1 link-offset-3 underline underline-offset-4">
					<b>Log In</b>
				</Link>
			</p>
		</div>
	)
}

const Register = () => {
	const dispatch = useDispatch<AppDispatch>()
	const termsRef = useRef<HTMLInputElement | null>(null)
	const navigate = useNavigate()
	const userSignUp = useSelector((state: RootState) => state.Auth.userSignUp)

	useEffect(() => {
		dispatch(resetAuth()as any)
	}, [dispatch])

	useEffect(() => {
		if (userSignUp) {
			navigate(MenuLinks.RegisterSuccess)
		}
	}, [userSignUp, navigate])

	const onSubmit = (formData: RegisterUserRequest) => {
		formData.timeZone = commonHelper.getCurrentUserTimeZone()
		formData.isTermsAndConditionsAccepted = termsRef.current?.checked ?? false
		dispatch(signupUser(formData)as any)
	}

	return (
		<>
			<PageBreadcrumb title="Sign Up" />
			<AuthContainer>
				<AuthLayout authTitle="Free Sign Up" helpText="Don't have an account? Create your account, it takes less than a minute." bottomLinks={<BottomLink />}>
					<VerticalForm<RegisterUserRequest> onSubmit={onSubmit}>
						<FormInput label="First Name" type="text" name="firstName" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" required />
						<FormInput label="Last Name" type="text" name="lastName" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" required />
						<FormInput label="Email address" type="text" name="email" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" required />
						<FormInput label="Password" type="password" name="password" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" required />
						<FormInput label="Confirm Password" type="password" name="confirmPassword" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" required />
						<FormInput label="Phone Number" type="number" name="phoneNumber" labelClassName="form-label-auth" containerClass="form-field-auth" className="form-input" />
						<div className="mb-6">
							<Label variant="checkbox" htmlFor="isTermsAndConditionsAccepted">
								<input ref={termsRef} name="isTermsAndConditionsAccepted" type="checkbox" className="form-checkbox rounded text-primary mr-2" id="isTermsAndConditionsAccepted" />I accept{' '}
								<Link to="#" className="text-gray-500">
									Terms and Conditions
								</Link>
							</Label>
						</div>
						<div className="text-center mb-6">
							<button className="btn bg-primary text-white loading" type="submit">
								{' '}
								Sign Up{' '}
							</button>
						</div>
					</VerticalForm>
				</AuthLayout>
			</AuthContainer>
		</>
	)
}

export default Register
