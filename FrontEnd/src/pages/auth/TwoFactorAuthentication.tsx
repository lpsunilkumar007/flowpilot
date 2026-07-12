import AuthLayout from '../../components/AuthPageLayout/AuthLayout'
import AuthContainer from '../../components/AuthPageLayout/AuthContainer'
import VerticalForm from '../../components/VerticalForm'
import FormInput from '../../components/FormInput'
import { MenuLinks } from '@/constants/menu'
import { VerifyTwoFactorRequest } from '@/helpers/api/WebApiClient'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { useEffect, useState } from 'react'
import { resetAuth, verifyTwoFactor, requestTwoFactorEmailCode } from '@/redux/auth/actions'
import { messageHelper } from '@/helpers/message.helper'

const BottomLink = ({ onTryAnotherMethod, disabled, timer }: { onTryAnotherMethod: () => void; disabled: boolean; timer: number }) => {
	const navigate = useNavigate()

	return (
		<div className="flex flex-col items-center space-y-4 w-full mt-4">
			<div className="text-center">
				<span className="text-muted text-xs">Didn't get the code? </span>

				<button
					onClick={(e) => {
						e.preventDefault()
						if (!disabled) onTryAnotherMethod()
					}}
					disabled={disabled}
					className={`text-xs font-semibold underline decoration-dashed underline-offset-4 transition-all
						${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-primary-focus'}`}
				>
					{disabled ? `Resend in ${timer}s` : 'Resend Code via Email'}
				</button>
			</div>

			<div className="w-full border-gray-100 pt-4">
				<button className="btn btn-outline text-center border-primary text-primary hover:bg-primary hover:text-white rounded w-full transition-all" onClick={() => navigate(MenuLinks.Login)}>
					Back To Login
				</button>
			</div>
		</div>
	)
}

const RESEND_INTERVAL = 30
const STORAGE_KEY = '2fa_resend_expiry'

const TwoFactorAuthentication = () => {
	const { sessionId } = useParams<{ sessionId: string }>()
	const location = useLocation()
	const dispatch = useDispatch<AppDispatch>()

	const user = useSelector((state: RootState) => state.Auth.user)
	const userLoggedIn = useSelector((state: RootState) => state.Auth.userLoggedIn)

	const redirectUrl = location?.search?.slice(6) || '/'
	const [timer, setTimer] = useState(0)
	const navigate = useNavigate()

	useEffect(() => {
		return () => {
			dispatch(resetAuth()as any)
		}
	}, [dispatch])

	useEffect(() => {
		const expiry = localStorage.getItem(STORAGE_KEY)
		if (expiry) {
			const remaining = Math.floor((Number(expiry) - Date.now()) / 1000)
			if (remaining > 0) {
				setTimer(remaining)
				return
			} else {
				localStorage.removeItem(STORAGE_KEY)
			}
		}
		setTimer(RESEND_INTERVAL)
		const newExpiry = Date.now() + RESEND_INTERVAL * 1000
		localStorage.setItem(STORAGE_KEY, newExpiry.toString())
	}, [])

	useEffect(() => {
		let interval: NodeJS.Timeout
		if (timer > 0) {
			interval = setInterval(() => {
				setTimer((prev: any) => prev - 1)
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [timer])

	const onSubmit = (formData: VerifyTwoFactorRequest) => {
		if (!sessionId || !formData.code) {
			messageHelper.showError('Verification code cannot be empty.')
			return
		}

		dispatch(verifyTwoFactor(formData.code, sessionId)as any)
	}

	const handleResendEmail = () => {
		if (sessionId && timer === 0) {
			dispatch(requestTwoFactorEmailCode(sessionId)as any)
			setTimer(RESEND_INTERVAL)
			const expiry = Date.now() + RESEND_INTERVAL * 1000
			localStorage.setItem(STORAGE_KEY, expiry.toString())
		}
	}

	useEffect(() => {
		if (userLoggedIn || user) {
			navigate(redirectUrl)
		}
	}, [userLoggedIn, user, redirectUrl, navigate])

	return (
		<AuthContainer>
			<AuthLayout authTitle="Two-Factor Verification" helpText="Please enter the 6-digit code from your Authenticator app or check your Email inbox." bottomLinks={<BottomLink onTryAnotherMethod={handleResendEmail} disabled={timer > 0} timer={timer} />}>
				<VerticalForm<VerifyTwoFactorRequest> onSubmit={onSubmit}>
					<FormInput label="Security Code" type="text" name="code" className="form-input text-center text-xl tracking-widest font-bold" placeholder="000000" containerClass="mb-8 space-y-3" labelClassName="form-label font-medium" required />

					<div className="text-center mb-2">
						<button className="btn bg-primary text-white w-full py-2 hover:shadow-lg transition-shadow" type="submit">
							Verify & Authenticate
						</button>
					</div>
				</VerticalForm>
			</AuthLayout>
		</AuthContainer>
	)
}

export default TwoFactorAuthentication
