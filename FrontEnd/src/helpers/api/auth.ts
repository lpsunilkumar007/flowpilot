import type { RegisterUserRequest, ResetForgotPasswordRequest } from '@/helpers/api/WebApiClient'
import type { IErrorResult } from '@/interfaces/IErrorResult'
import { authService } from '@/services/AuthService'

/**
 * Normalize unknown error to user-facing string.
 * Use consistently across auth sagas for authApiResponseError and toasts.
 */
export function normalizeAuthError(error: unknown): string {
	if (error instanceof Error) return error.message
	if (typeof error === 'string') return error
	const err = error as IErrorResult & { message?: string }
	return err?.exception ?? err?.message ?? 'Unknown error'
}

// account - delegates to authService for consistent auth API surface
async function login(params: { username: string; password: string }) {
	return authService.login(params)
}

async function logout() {
	await authService.logout?.()
}

async function signup(params: RegisterUserRequest) {
	return authService.selfRegister(params)
}

async function resetPassword(params: ResetForgotPasswordRequest) {
	return authService.resetPassword(params)
}

async function confirmEmail(userId: string, code: string) {
	return authService.confirmEmail(userId, code)
}

async function forgotPassword(params: { username: string }) {
	return authService.forgotPassword(params)
}

async function fetchUserProfile() {
	return authService.getProfile()
}

async function fetchUserPermissions() {
	return authService.getPermissions()
}

async function verifyTwoFactorApi(params: { code: string; twoFactorSessionId: string }) {
	return authService.verifyTwoFactor(params)
}

async function requestTwoFactorEmailCode(sessionId: string) {
	return authService.requestTwoFactorEmailCode(sessionId)
}

export { login, logout, signup, forgotPassword, resetPassword, confirmEmail, fetchUserProfile, fetchUserPermissions, verifyTwoFactorApi, requestTwoFactorEmailCode }
