import { tokensClient } from '@/helpers/api/apiClients'
import type { ITokenRepository } from './contracts/ITokenRepository'

/**
 * Token service - abstraction over tokens API client.
 * Use this instead of importing tokensClient directly for better testability.
 */
export const tokenService: ITokenRepository = {
	getToken: (request) => tokensClient.getToken(request),
	verifyTwoFactor: (request) => tokensClient.verifyTwoFactor(request),
	getSocialMediaToken: (request) => tokensClient.getSocialMediaToken(request),
	requestTwoFactorEmailCode: (sessionId: string) => tokensClient.requestTwoFactorEmailCode(sessionId),
}
