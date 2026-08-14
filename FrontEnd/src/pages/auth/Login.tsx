import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../../redux/store'
import { loginUser, resetAuth, socialMediaLogin } from '../../redux/actions'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'

// form validation
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// components
import AuthLayout from '../../components/AuthPageLayout/AuthLayout'
import AuthContainer from '../../components/AuthPageLayout/AuthContainer'
import VerticalForm from '../../components/VerticalForm'
import FormInput from '../../components/FormInput'
import { MenuLinks } from '@/constants/menu'
import { SocialMediaTokenRequest, UserRegistrationType } from '@/helpers/api/WebApiClient'
import { authService } from '@/services/AuthService'
import GoogleLoginForm from './GoogleLoginForm'
import { messageHelper } from '@/helpers/message.helper'
import FacebookLoginForm from './FacebookLoginForm'

interface UserData {
	username: string
	password: string
}

/**
 * Bottom Links goes here
 */
const BottomLink = () => {
	const navigate = useNavigate()
	return (
		<>
			<p className="text-center my-2">Don&apos;t have an account?&nbsp;</p>
			<button className="btn text-center bg-primary text-white rounded w-full" onClick={() => navigate(MenuLinks.Register)}>
				Sign up with email
			</button>
		</>
	)
}

const PasswordInputChild = () => {
	return (
		<Link to={MenuLinks.RecoverPassword} className="text-muted text-xs underline decoration-dashed underline-offset-4">
			Forgot your password?
		</Link>
	)
}

const Login = () => {
	const dispatch = useDispatch<AppDispatch>()

	const { user, userLoggedIn, loading, requiresTwoFactor, twoFactorSessionId } = useSelector(
		(state: RootState) => ({
			user: state.Auth.user,
			loading: state.Auth.loading,
			requiresTwoFactor: state.Auth.requiresTwoFactor,
			twoFactorSessionId: state.Auth.twoFactorSessionId,
			error: state.Auth.error,
			userLoggedIn: state.Auth.userLoggedIn,
		}),
		shallowEqual
	)

	useEffect(() => {
		dispatch(resetAuth() as any)
	}, [dispatch])

	/*
  form validation schema
  */
	const schemaResolver = yupResolver(
		yup.object().shape({
			username: yup.string().required('Please enter Username'),
			password: yup.string().required('Please enter Password'),
		})
	)

	/*
  handle form submission
  */
	const onSubmit = async (formData: UserData) => {
		dispatch(loginUser(formData['username'], formData['password']) as any)
	}

	const location = useLocation()

	// redirection back to where user got redirected from
	const redirectUrl = location?.search?.slice(6) || '/'

	useEffect(() => {
		if (userLoggedIn || user) {
			window.location.href = redirectUrl
		}
	}, [userLoggedIn, user, redirectUrl])

	useEffect(() => {
		if (requiresTwoFactor) {
			window.location.href = MenuLinks.TwoFactorVerification.replace(':sessionId', twoFactorSessionId.toString())
		}
	}, [requiresTwoFactor])

	const handleFacebookLogin = async (_response: any, profile: any) => {
		try {
			const request = new SocialMediaTokenRequest()
			request.jsonResponse = JSON.stringify(profile)
			request.socialMediaType = UserRegistrationType.Facebook
			const result = await authService.getSocialMediaToken(request)
			if (result) {
				dispatch(socialMediaLogin(result) as any)
			} else {
				messageHelper.showError('No result from getSocialMediaToken')
			}
		} catch (error: any) {
			messageHelper.showError('Facebook login error : ' + error.exception)
		}
	}

	const handleGoogleLogin = async (profile: any) => {
		try {
			const request = new SocialMediaTokenRequest()
			request.jsonResponse = JSON.stringify(profile)
			request.socialMediaType = UserRegistrationType.Google
			const result = await authService.getSocialMediaToken(request)
			if (result) {
				dispatch(socialMediaLogin(result) as any)
			} else {
				messageHelper.showError('No result from getSocialMediaToken')
			}
		} catch (error: any) {
			messageHelper.showError('Google login error : ' + error.exception)
		}
	}

	return (
		<>
			{/* {(userLoggedIn || user) && <Navigate to={redirectUrl} />} */}

			<AuthContainer>
				<AuthLayout authTitle="Sign In" helpText="Enter your email address and password to access admin panel." bottomLinks={<BottomLink />}>
					<VerticalForm<UserData> onSubmit={onSubmit} resolver={schemaResolver}>
						<FormInput label="Email Address" type="email" name="username" className="form-input" placeholder="Enter your email" containerClass="form-field-auth" labelClassName="form-label-auth" required />

						<FormInput label="Password" type="password" name="password" placeholder="Enter your password" className="form-input rounded-e-none" containerClass="form-field-auth" labelClassName="form-label-auth" labelContainerClassName="flex justify-between items-center mb-2" required>
							<PasswordInputChild />
						</FormInput>

						{/* <FormInput label="Remember me" type="checkbox" name="checkbox" className="form-checkbox rounded text-primary" containerClass="mb-6" labelClassName="ms-2" defaultChecked /> */}

						<div className="text-center mb-6">
							<button className="btn bg-primary text-white loading" type="submit" disabled={loading}>
								Log In
							</button>
						</div>
					</VerticalForm>
					{/* <div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
						</div>
					</div> 
					 <div className="space-y-3">
						<FacebookLoginForm onLoginSuccess={handleFacebookLogin} />
						<GoogleLoginForm onLoginSuccess={handleGoogleLogin} />
					</div> */}
				</AuthLayout>
			</AuthContainer>
		</>
	)
}

export default Login
