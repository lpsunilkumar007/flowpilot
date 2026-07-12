import { all, fork, put, takeEvery, call } from 'redux-saga/effects'
import { SagaIterator } from '@redux-saga/core'

// apicore
import { APICore } from '../../helpers/api/apiCore'

// helpers
import { login as loginApi, logout as logoutApi, signup as signupApi, forgotPassword as forgotPasswordApi, resetPassword as resetPasswordApi, confirmEmail as confirmEmailApi, fetchUserProfile as fetchUserProfileApi, fetchUserPermissions as fetchUserPermissionsApi, verifyTwoFactorApi, requestTwoFactorEmailCode as requestTwoFactorEmailCodeApi, normalizeAuthError } from '../../helpers/api/auth'
import { messageHelper } from '../../helpers/message.helper'

// actions
import { authApiResponseSuccess, authApiResponseError, fetchUserProfileSuccess, fetchUserPermissionsSuccess } from './actions'

// constants
import { AuthActionTypes } from './constants'

interface UserData {
	payload: {
		username: string
		password: string
	}
	type: string
}

interface SocialLoginData {
	type: string
	payload: { token?: string; refreshToken?: string; refreshTokenExpiryTime?: unknown }
}

interface VerifyTwoFactorData {
	type: string
	payload: {
		code: string
		twoFactorSessionId: string
	}
}

const api = new APICore()

/**
 * Login the user
 * @param {*} payload - username and password
 */

function* login({ payload: { username, password } }: UserData): SagaIterator {
	try {
		const response = yield call(loginApi, { username, password })

		if (response && response.requiresTwoFactor == false) {
			const user = response
			api.setLoggedInUser(user)
			yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, user))

			const response1 = yield call(fetchUserProfileApi)
			yield put(fetchUserProfileSuccess(AuthActionTypes.FETCH_USER_PROFILE, response1))

			const response2 = yield call(fetchUserPermissionsApi)
			yield put(fetchUserPermissionsSuccess(AuthActionTypes.FETCH_USER_PERMISSION, response2))
		} else if (response && response.requiresTwoFactor == true) {
			yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_Requires_TwoFactor, response))
		} else {
			api.setLoggedInUser(null)
			const errorMsg = 'login fail'
			yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMsg))
			messageHelper.showErrorResult(new Error(errorMsg))
		}
	} catch (error: unknown) {
		api.setLoggedInUser(null)
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

/**
 * Login via social Media
 */
function* socialMediaLogin({ payload }: SocialLoginData): SagaIterator {
	try {
		const user = payload
		if (user) {
			api.setLoggedInUser(user)
			yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, user))

			const response1 = yield call(fetchUserProfileApi)
			yield put(fetchUserProfileSuccess(AuthActionTypes.FETCH_USER_PROFILE, response1))

			const response2 = yield call(fetchUserPermissionsApi)
			yield put(fetchUserPermissionsSuccess(AuthActionTypes.FETCH_USER_PERMISSION, response2))
		} else {
			api.setLoggedInUser(null)
			const errorMsg = 'facebook login fail'
			yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMsg))
			messageHelper.showErrorResult(new Error(errorMsg))
		}
	} catch (error: unknown) {
		api.setLoggedInUser(null)
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

/**
 * Logout the user
 */
function* logout(): SagaIterator {
	try {
		yield call(logoutApi)
		api.setLoggedInUser(null)
		yield put(authApiResponseSuccess(AuthActionTypes.LOGOUT_USER, {}))
	} catch (error: unknown) {
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.LOGOUT_USER, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

function* signup({ payload }: { payload: Record<string, unknown> }): SagaIterator {
	try {
		const response = yield call(signupApi as unknown as (p: Record<string, unknown>) => Promise<unknown>, payload)
		const user = (response as { data?: unknown })?.data ?? response
		yield put(authApiResponseSuccess(AuthActionTypes.SIGNUP_USER, user))
		messageHelper.showSuccess('Registration successful')
	} catch (error: unknown) {
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.SIGNUP_USER, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

function* forgotPassword({ payload: { username } }: UserData): SagaIterator {
	try {
		const response = yield call(forgotPasswordApi, { username })
		const message = typeof response === 'string' ? response : (response as any)?.data ?? response
		yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD, message))
		messageHelper.showSuccess(typeof message === 'string' ? message : String(message))
	} catch (error: unknown) {
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

function* verifyTwoFactor({ payload: { code, twoFactorSessionId } }: VerifyTwoFactorData): SagaIterator {
	try {
		const response = yield call(verifyTwoFactorApi, {
			code,
			twoFactorSessionId,
		})
		api.setLoggedInUser(response)
		yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, response))

		const response1 = yield call(fetchUserProfileApi)
		yield put(fetchUserProfileSuccess(AuthActionTypes.FETCH_USER_PROFILE, response1))

		const response2 = yield call(fetchUserPermissionsApi)
		yield put(fetchUserPermissionsSuccess(AuthActionTypes.FETCH_USER_PERMISSION, response2))
		messageHelper.showSuccess('Verification successful')
	} catch (error: unknown) {
		api.setLoggedInUser(null)
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.VERIFY_TWO_FACTOR, errorMsg))
		messageHelper.showError(errorMsg)
	}
}

function* requestTwoFactorEmailCode({ payload: { sessionId } }: { type: string; payload: { sessionId: string } }): SagaIterator {
	try {
		yield call(requestTwoFactorEmailCodeApi, sessionId)
		yield put(authApiResponseSuccess(AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE, {}))
		messageHelper.showSuccess('Verification code sent to your email.')
	} catch (error: unknown) {
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE, errorMsg))
		messageHelper.showError(errorMsg)
	}
}

export function* watchLoginUser() {
	yield takeEvery(AuthActionTypes.LOGIN_USER, login)
}

export function* watchSocialMediaLogin() {
	yield takeEvery(AuthActionTypes.LOGIN_USER_SOCIALMEDIA, socialMediaLogin)
}

export function* watchLogout() {
	yield takeEvery(AuthActionTypes.LOGOUT_USER, logout)
}

export function* watchSignup(): Generator {
	yield takeEvery(AuthActionTypes.SIGNUP_USER as never, signup)
}

export function* watchForgotPassword(): any {
	yield takeEvery(AuthActionTypes.FORGOT_PASSWORD, forgotPassword)
}
function* resetPasswordSaga({ payload }: { payload: Record<string, unknown> }): SagaIterator {
	try {
		const response = yield call(resetPasswordApi as unknown as (p: Record<string, unknown>) => Promise<string>, payload)
		const message = typeof response === 'string' ? response : (response as { data?: unknown })?.data ?? response
		yield put(authApiResponseSuccess(AuthActionTypes.RESET_PASSWORD, message))
		messageHelper.showSuccess(typeof message === 'string' ? message : String(message))
	} catch (error: unknown) {
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.RESET_PASSWORD, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

function* confirmMailSaga({ payload }: { payload: { userId: string; code: string } }): SagaIterator {
	try {
		const response = yield call(confirmEmailApi, payload.userId, payload.code)
		yield put(authApiResponseSuccess(AuthActionTypes.CONFIRM_MAIL, response))
	} catch (error: unknown) {
		const errorMsg = normalizeAuthError(error)
		yield put(authApiResponseError(AuthActionTypes.CONFIRM_MAIL, errorMsg))
		messageHelper.showErrorResult(error)
	}
}

export function* watchVerifyTwoFactor() {
	yield takeEvery(AuthActionTypes.VERIFY_TWO_FACTOR, verifyTwoFactor)
}

export function* watchRequestTwoFactorEmailCode() {
	yield takeEvery(AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE, requestTwoFactorEmailCode)
}

export function* watchResetPassword(): Generator {
	yield takeEvery(AuthActionTypes.RESET_PASSWORD as never, resetPasswordSaga)
}

export function* watchConfirmMail(): Generator {
	yield takeEvery(AuthActionTypes.CONFIRM_MAIL as never, confirmMailSaga)
}

function* authSaga() {
	yield all([fork(watchLoginUser), fork(watchSocialMediaLogin), fork(watchLogout), fork(watchSignup), fork(watchForgotPassword), fork(watchVerifyTwoFactor), fork(watchRequestTwoFactorEmailCode), fork(watchResetPassword), fork(watchConfirmMail)])
}

export default authSaga
