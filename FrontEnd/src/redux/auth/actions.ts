// constants
import type { RegisterUserRequest, ResetForgotPasswordRequest, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { AuthActionTypes } from './constants'

export interface AuthActionType {
	type: AuthActionTypes
	payload: Record<string, unknown>
}

/** Union type for auth reducer - replaces action: any */
export type AuthAction =
	| { type: AuthActionTypes.API_RESPONSE_SUCCESS; payload: { actionType: string; data?: unknown } }
	| { type: AuthActionTypes.API_RESPONSE_ERROR; payload: { actionType: string; error?: string } }
	| { type: AuthActionTypes.LOGIN_USER; payload: { username: string; password: string } }
	| { type: AuthActionTypes.LOGOUT_USER; payload: Record<string, unknown> }
	| { type: AuthActionTypes.SIGNUP_USER; payload: RegisterUserRequest }
	| { type: AuthActionTypes.FORGOT_PASSWORD; payload: { username: string } }
	| { type: AuthActionTypes.RESET_PASSWORD; payload: ResetForgotPasswordRequest }
	| { type: AuthActionTypes.CONFIRM_MAIL; payload: { userId: string; code: string } }
	| { type: AuthActionTypes.RESET; payload: Record<string, unknown> }
	| { type: AuthActionTypes.LOGIN_USER_SOCIALMEDIA; payload: Record<string, unknown> }
	| { type: AuthActionTypes.VERIFY_TWO_FACTOR; payload: { code: string; twoFactorSessionId: string } }
	| { type: AuthActionTypes.FETCH_USER_PROFILE; payload: Record<string, unknown> }
	| { type: AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE; payload: { sessionId: string } }

interface UserTokenData {
	refreshToken: string
	refreshTokenExpiryTime: Date
	token: string
}

// common success
export const authApiResponseSuccess = (actionType: string, data: UserTokenData | unknown): AuthActionType => ({
	type: AuthActionTypes.API_RESPONSE_SUCCESS,
	payload: { actionType, data },
})
// common error
export const authApiResponseError = (actionType: string, error: string): AuthActionType => ({
	type: AuthActionTypes.API_RESPONSE_ERROR,
	payload: { actionType, error },
})

export const loginUser = (username: string, password: string): AuthActionType => ({
	type: AuthActionTypes.LOGIN_USER,
	payload: { username, password },
})

export const socialMediaLogin = (userTokenData: UserTokenData | object): AuthActionType => ({
	type: AuthActionTypes.LOGIN_USER_SOCIALMEDIA,
	payload: userTokenData as Record<string, unknown>,
})

export const logoutUser = (): AuthActionType => ({
	type: AuthActionTypes.LOGOUT_USER,
	payload: {},
})

export const signupUser = (request: RegisterUserRequest): AuthActionType => ({
	type: AuthActionTypes.SIGNUP_USER,
	payload: request as unknown as Record<string, unknown>,
})

export const forgotPassword = (username: string): AuthActionType => ({
	type: AuthActionTypes.FORGOT_PASSWORD,
	payload: { username },
})

export const resetPassword = (request: ResetForgotPasswordRequest): AuthActionType => ({
	type: AuthActionTypes.RESET_PASSWORD,
	payload: request as unknown as Record<string, unknown>,
})

export const confirmMail = (userId: string, code: string): AuthActionType => ({
	type: AuthActionTypes.CONFIRM_MAIL,
	payload: { userId, code },
})

export const resetAuth = (): AuthActionType => ({
	type: AuthActionTypes.RESET,
	payload: {},
})

export const fetchUserProfile = (): AuthActionType => ({
	type: AuthActionTypes.FETCH_USER_PROFILE,
	payload: {},
})

export const fetchUserProfileSuccess = (actionType: string, data: ViewUserDetailsResponse | Record<string, unknown>): AuthActionType => ({
	type: AuthActionTypes.API_RESPONSE_SUCCESS,
	payload: { actionType, data },
})

export const fetchUserPermissionsSuccess = (actionType: string, data: string[] | Record<string, unknown>): AuthActionType => ({
	type: AuthActionTypes.API_RESPONSE_SUCCESS,
	payload: { actionType, data },
})

export const verifyTwoFactor = (code: string, twoFactorSessionId: string): AuthActionType => ({
	type: AuthActionTypes.VERIFY_TWO_FACTOR,
	payload: { code, twoFactorSessionId },
})

export const requestTwoFactorEmailCode = (sessionId: string): AuthActionType => ({
	type: AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE,
	payload: { sessionId },
})

