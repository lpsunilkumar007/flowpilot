import type {
	ForgotPasswordRequest,
	RegisterUserRequest,
	RegisterUserResponse,
	ResetForgotPasswordRequest,
	SocialMediaTokenRequest,
	TokenRequest,
	TokenResponse,
	VerifyTwoFactorRequest,
	ViewUserDetailsResponse,
} from '@/helpers/api/WebApiClient'

/**
 * Auth repository - high-level auth API for login, register, 2FA, and profile flows.
 * Wraps tokenService, userService, and personalService for consistent auth surface.
 */
export interface IAuthRepository {
	/** Login with email and password. Returns token or 2FA challenge. */
	login(params: { username: string; password: string }): Promise<TokenResponse>

	/** Verify 2FA code and complete login. */
	verifyTwoFactor(params: { code: string; twoFactorSessionId: string }): Promise<TokenResponse>

	/** Request password reset email. */
	forgotPassword(params: { username: string }): Promise<string>

	/** Social media login (Google, Facebook, etc.). */
	getSocialMediaToken(request: SocialMediaTokenRequest): Promise<TokenResponse>

	/** Self-register new user. */
	selfRegister(request: RegisterUserRequest): Promise<RegisterUserResponse>

	/** Reset password with token from email. */
	resetPassword(request: ResetForgotPasswordRequest): Promise<string>

	/** Confirm email with code. */
	confirmEmail(userId: string, code: string): Promise<string>

	/** Fetch current user profile. */
	getProfile(): Promise<ViewUserDetailsResponse>

	/** Fetch current user permissions. */
	getPermissions(): Promise<string[]>

	/** Logout - invalidate session server-side if backend supports it. Currently no-op (client clears session). */
	logout?(): Promise<void>

	/** Request 2FA code via email as an alternative method. */
	requestTwoFactorEmailCode(sessionId: string): Promise<void>
}
