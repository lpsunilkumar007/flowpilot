import { personalClient } from '@/helpers/api/apiClients'
import type { IPersonalRepository } from './contracts/IPersonalRepository'

/**
 * Personal service - abstraction over personal API client.
 * Use this instead of importing personalClient directly for better testability.
 */
export const personalService: IPersonalRepository = {
	getProfile: () => personalClient.getProfile(),
	getPermissions: () => personalClient.getPermissions(),
	changePassword: (model) => personalClient.changePassword(model),
	getTwoFactorAuthenticationDetails: () => personalClient.getTwoFactorAuthenticationDetails(),
	updateTwoFactorAuthenticationDetails: (request) => personalClient.updateTwoFactorAuthenticationDetails(request),
	updateProfile: (request) => personalClient.updateProfile(request),
	generateAuthenticator: () => personalClient.generateAuthenticatorEnable(),
	verifyAuthenticator: (code: string) => personalClient.verifyAuthenticator(code),
}
