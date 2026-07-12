import { ForgotPasswordRequest, TokenRequest, VerifyTwoFactorRequest } from '@/helpers/api/WebApiClient'
import { tokenService } from '@/services/TokenService'
import { userService } from '@/services/UserService'
import { personalService } from '@/services/PersonalService'
import type { IAuthRepository } from './contracts/IAuthRepository'

/**
 * Auth service - wraps tokenService, userService, and personalService for login/register/2FA flows.
 * Keeps auth API surface consistent with orbit services.
 */
export const authService: IAuthRepository = {
	login: async (params) => {
		const request = new TokenRequest()
		request.email = params.username
		request.password = params.password
		return tokenService.getToken(request)
	},

	verifyTwoFactor: async (params) => {
		const request = new VerifyTwoFactorRequest()
		request.code = params.code
		request.twoFactorSessionId = params.twoFactorSessionId
		return tokenService.verifyTwoFactor(request)
	},

	forgotPassword: async (params) => {
		const request = new ForgotPasswordRequest({ email: params.username })
		return userService.forgotPassword(request)
	},

	getSocialMediaToken: (request) => tokenService.getSocialMediaToken(request),

	selfRegister: (request) => userService.selfRegister(request),

	resetPassword: (request) => userService.resetPassword(request),

	confirmEmail: (userId, code) => userService.confirmEmail(userId, code),

	getProfile: () => personalService.getProfile(),

	getPermissions: () => personalService.getPermissions(),

	// Backend has no logout endpoint yet - client clears session via api.setLoggedInUser(null) in saga.
	// When backend adds POST /api/tokens/logout or similar, implement here.
	logout: async () => {
		/* no-op */
	},

	requestTwoFactorEmailCode: (sessionId: string) => tokenService.requestTwoFactorEmailCode(sessionId),
}
