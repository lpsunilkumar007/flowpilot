import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { messageHelper } from '@/helpers/message.helper'

interface GoogleProfile {
	id: string
	name: string
	email: string
	picture: string
	given_name?: string
	family_name?: string
}

interface GoogleLoginFormProps {
	onLoginSuccess?: (profile: GoogleProfile) => void
}

const GoogleLoginForm: React.FC<GoogleLoginFormProps> = ({ onLoginSuccess }) => {
	const clientId = '407836420761-lf58bfs0pdv22cm6pa8k3gai46o2omii.apps.googleusercontent.com'

	const handleSuccess = (credentialResponse: any) => {
		if (credentialResponse.credential) {
			try {
				const decoded: any = jwtDecode(credentialResponse.credential)

				const googleProfile: GoogleProfile = {
					id: decoded.sub,
					name: decoded.name,
					email: decoded.email,
					picture: decoded.picture,
					given_name: decoded.given_name,
					family_name: decoded.family_name,
				}

				if (googleProfile.email && googleProfile.name && onLoginSuccess) {
					onLoginSuccess(googleProfile)
				}
			} catch (error) {
				messageHelper.showError('Failed to decode Google token')
			}
		}
	}

	const handleFailure = () => {
		const errorMessage = 'Google login failed. Please try again.'
		messageHelper.showError(errorMessage)
	}

	return (
		<GoogleOAuthProvider clientId={clientId}>
			<div className="text-center">
				<GoogleLogin onSuccess={handleSuccess} onError={handleFailure} useOneTap={false} logo_alignment="center" shape="rectangular" size="large" width="100%" text="signin_with" />
			</div>
		</GoogleOAuthProvider>
	)
}

export default GoogleLoginForm
