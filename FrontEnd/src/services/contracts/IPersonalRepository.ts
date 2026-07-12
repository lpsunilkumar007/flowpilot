import type {
	AuthenticatorEnableResponse,
	ChangePasswordRequest,
	UpdateTwoFactorAuthenticationDetailsRequest,
	UpdateUserRequest,
	ViewUserDetailsResponse,
	ViewUserTwoFactorAuthenticationDetailsResponse,
} from '@/helpers/api/WebApiClient'

export interface IPersonalRepository {
	getProfile(): Promise<ViewUserDetailsResponse>
	getPermissions(): Promise<string[]>
	changePassword(model: ChangePasswordRequest): Promise<string>
	getTwoFactorAuthenticationDetails(): Promise<ViewUserTwoFactorAuthenticationDetailsResponse>
	updateTwoFactorAuthenticationDetails(request: UpdateTwoFactorAuthenticationDetailsRequest): Promise<string>
	updateProfile(request: UpdateUserRequest): Promise<string>
	generateAuthenticator(): Promise<AuthenticatorEnableResponse>
	verifyAuthenticator(code: string): Promise<boolean>
}
