// apicore
import { TenantCurrentSubscriptionDetailResponse, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { subscriptionService } from '@/services/SubscriptionService'
import { personalService } from '@/services/PersonalService'
import { APICore } from '../../helpers/api/apiCore'

// constants
import { AuthActionTypes } from './constants'
import type { AuthAction } from './actions'

const api = new APICore()

const INIT_STATE = {
	userTokenData: api.getLoggedInUser(),
	loading: false,
	userData: api.isUserAuthenticated() ? await personalService.getProfile() : {},
	userPermissions: api.isUserAuthenticated() ? await personalService.getPermissions() : [],
	tenantSubscriptionPlan: api.isUserAuthenticated() ? await subscriptionService.getCurrentSubscriptionDetail() : [],
	error: null,
}

interface UserTokenData {
	refreshToken: string
	refreshTokenExpiryTime: Date
	token: string
}

// interface AuthActionType {
//   type:
//   | AuthActionTypes.API_RESPONSE_SUCCESS
//   | AuthActionTypes.API_RESPONSE_ERROR
//   | AuthActionTypes.LOGIN_USER
//   | AuthActionTypes.LOGOUT_USER
//   | AuthActionTypes.RESET;
//   payload: {
//     actionType?: string;
//     data?: UserData | {};
//     error?: string;
//   };
// }

interface State {
	userTokenData?: UserTokenData | {} | null
	userData?: ViewUserDetailsResponse | {}
	loading?: boolean
	value?: boolean
	userPermissions?: string[]
	tenantSubscriptionPlan?: TenantCurrentSubscriptionDetailResponse | {}
	requiresTwoFactor?: boolean
	twoFactorSessionId?: string
	error?: string | null
	userLoggedIn?: boolean
	userLogout?: boolean
	userSignUp?: boolean
	registerError?: string | null
	passwordReset?: boolean
	passwordChange?: boolean
	resetPasswordSuccess?: unknown
	confirmMailSuccess?: boolean
	confirmMailMessage?: unknown
	confirmMailError?: string | null
}

const Auth = (state: State = INIT_STATE, action: AuthAction): State => {
	switch (action.type) {
		case AuthActionTypes.API_RESPONSE_SUCCESS:
			switch (action.payload.actionType) {
				case AuthActionTypes.LOGIN_USER: {
					return {
						...state,
						userTokenData: action.payload.data as UserTokenData,
						userLoggedIn: true,
						loading: false,
					}
				}
				case AuthActionTypes.SIGNUP_USER: {
					return {
						...state,
						loading: false,
						userSignUp: true,
					}
				}
				case AuthActionTypes.LOGOUT_USER: {
					return {
						...state,
						userTokenData: null as null,
						loading: false,
						userLogout: true,
					}
				}
				case AuthActionTypes.FORGOT_PASSWORD: {
					return {
						...state,
						resetPasswordSuccess: action.payload.data,
						loading: false,
						passwordReset: true,
					}
				}
				case AuthActionTypes.FETCH_USER_PROFILE: {
					return {
						...state,
						userData: action.payload.data as ViewUserDetailsResponse,
					}
				}
				case AuthActionTypes.FETCH_USER_PERMISSION: {
					return {
						...state,
						userPermissions: action.payload.data as string[],
					}
				}
				case AuthActionTypes.FETCH_TENANT_SUBSCRIPTION_PLAN:
					return { ...state, tenantSubscriptionPlan: action.payload.data as TenantCurrentSubscriptionDetailResponse }

				case AuthActionTypes.LOGIN_Requires_TwoFactor: {
					const data = action.payload.data as { requiresTwoFactor?: boolean; twoFactorSessionId?: string }
					return {
						...state,
						requiresTwoFactor: data?.requiresTwoFactor,
						twoFactorSessionId: data?.twoFactorSessionId,
						userLoggedIn: false,
						loading: false,
					}
				}

				case AuthActionTypes.RESET_PASSWORD: {
					return {
						...state,
						resetPasswordSuccess: action.payload.data,
						loading: false,
						passwordReset: true,
					}
				}
				case AuthActionTypes.CONFIRM_MAIL: {
					return {
						...state,
						confirmMailMessage: action.payload.data,
						loading: false,
						confirmMailSuccess: true,
					}
				}
				case AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE: {
					return {
						...state,
						loading: false,
					}
				}

				default:
					return { ...state }
			}

		case AuthActionTypes.API_RESPONSE_ERROR:
			switch (action.payload.actionType) {
				case AuthActionTypes.LOGIN_USER: {
					return {
						...state,
						error: action.payload.error,
						userLoggedIn: false,
						loading: false,
					}
				}
				case AuthActionTypes.SIGNUP_USER: {
					return {
						...state,
						registerError: action.payload.error,
						userSignUp: false,
						loading: false,
					}
				}
				case AuthActionTypes.FORGOT_PASSWORD:
					{
						return {
							...state,
							error: action.payload.error,
							loading: false,
							passwordReset: false,
						}
					}
				case AuthActionTypes.VERIFY_TWO_FACTOR: {
					return {
						...state,
						error: action.payload.error,
						loading: false,
						userLoggedIn: false,
					}
				}
				case AuthActionTypes.RESET_PASSWORD: {
					return {
						...state,
						error: action.payload.error,
						loading: false,
						passwordReset: false,
					}
				}
				case AuthActionTypes.CONFIRM_MAIL: {
					return {
						...state,
						confirmMailError: action.payload.error,
						loading: false,
						confirmMailSuccess: false,
					}
				}
				case AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE: {
					return {
						...state,
						error: action.payload.error,
						loading: false,
					}
				}
				default:
					return { ...state }
			}

		case AuthActionTypes.RESET_PASSWORD:
		case AuthActionTypes.CONFIRM_MAIL:
			return { ...state, loading: true }

		case AuthActionTypes.LOGIN_USER:
			return { ...state, loading: true, userLoggedIn: false }
		case AuthActionTypes.VERIFY_TWO_FACTOR:
		case AuthActionTypes.REQUEST_TWO_FACTOR_EMAIL_CODE:
			return { ...state, loading: true, error: null }
		case AuthActionTypes.LOGOUT_USER:
			return { ...state, loading: true, userLogout: false }
		case AuthActionTypes.RESET:
			return {
				...state,
				loading: false,
				error: null,
				userSignUp: false,
				userLoggedIn: false,
				passwordReset: false,
				passwordChange: false,
				resetPasswordSuccess: null,
				confirmMailSuccess: false,
				confirmMailError: null,
				confirmMailMessage: null,
			}
		default:
			return { ...state }
	}
}

export default Auth
