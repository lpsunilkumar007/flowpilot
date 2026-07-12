import React, { useEffect } from 'react'
import FacebookLoginImport from '@greatsumini/react-facebook-login'
const FacebookLogin = (FacebookLoginImport as any).default || FacebookLoginImport
import type { SuccessResponse, FailResponse, ProfileSuccessResponse } from '@greatsumini/react-facebook-login'
import { messageHelper } from '@/helpers/message.helper'

interface FacebookLoginFormProps {
	onLoginSuccess?: (response: SuccessResponse, profile: ProfileSuccessResponse) => void
}

const FacebookLoginForm: React.FC<FacebookLoginFormProps> = ({ onLoginSuccess }) => {
	useEffect(() => {
		if (!document.getElementById('facebook-jssdk')) {
			; (window as any).fbAsyncInit = function () {
				; (window as any).FB.init({
					appId: '2799399226930986', // your Facebook App ID
					cookie: true, // enable cookies to allow the server to access the session
					xfbml: false, // disable parsing XFBML tags
					version: 'v18.0', // Facebook API version
				})
			}

			// Create a <script> element to load the Facebook SDK asynchronously
			const script = document.createElement('script')
			script.id = 'facebook-jssdk'
			script.src = 'https://connect.facebook.net/en_US/sdk.js'
			script.async = true
			script.defer = true
			script.crossOrigin = 'anonymous'
			script.onload = () => {
				messageHelper.showError('Facebook SDK script loaded')
			}
			script.onerror = () => {
				messageHelper.showError('Failed to load Facebook SDK')
			}
			document.body.appendChild(script)
		}
	}, [])

	const handleSuccess = (response: SuccessResponse) => {
		if (response.accessToken) {
			localStorage.setItem('fb_access_token', response.accessToken)
			localStorage.setItem('fb_response', JSON.stringify(response))
		}
	}

	const handleFailure = (error: FailResponse) => {
		const errorMessage = error?.status || (error as any)?.error?.message || 'Facebook login failed. Please try again.'
		messageHelper.showError(errorMessage)
	}

	const handleProfileSuccess = (profile: ProfileSuccessResponse) => {
		if (profile.email && profile.name) {
			const accessToken = localStorage.getItem('fb_access_token')
			const storedResponse = localStorage.getItem('fb_response')

			if (accessToken && onLoginSuccess && profile.id) {
				let response: SuccessResponse
				if (storedResponse) {
					try {
						response = JSON.parse(storedResponse) as SuccessResponse
					} catch {
						response = {
							accessToken,
							userID: profile.id,
							expiresIn: '0',
							signedRequest: '',
						} as SuccessResponse
					}
				} else {
					response = {
						accessToken,
						userID: profile.id,
						expiresIn: '0',
						signedRequest: '',
					} as SuccessResponse
				}
				onLoginSuccess(response, profile)
			}
		}
	}

	return (
		<div className="text-center">
			<FacebookLogin
				appId="2799399226930986"
				initParams={{
					version: 'v18.0',
					xfbml: false,
					cookie: true,
				}}
				onSuccess={handleSuccess}
				onFail={handleFailure}
				onProfileSuccess={handleProfileSuccess}
				scope="public_profile,email"
				fields="name,email,picture"
				style={{
					backgroundColor: '#1877F2',
					color: '#f7f6f6ff',
					border: 'none',
					borderRadius: '6px',
					padding: '10px 20px',
					fontSize: '16px',
					cursor: 'pointer',
					fontWeight: '500',
					display: 'inline-block',
					minWidth: '200px',
					width: '100%',
				}}
				className="facebook-login-button"
			>
				<i className="ri-facebook-circle-fill me-2 social-icon"></i>
				Login with Facebook
			</FacebookLogin>
		</div>
	)
}

export default FacebookLoginForm
