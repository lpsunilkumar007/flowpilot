import type { SocialMediaTokenRequest, TokenRequest, TokenResponse, VerifyTwoFactorRequest } from '@/helpers/api/WebApiClient'

export interface ITokenRepository {
	getToken(request: TokenRequest): Promise<TokenResponse>
	verifyTwoFactor(request: VerifyTwoFactorRequest): Promise<TokenResponse>
	getSocialMediaToken(request: SocialMediaTokenRequest): Promise<TokenResponse>
	requestTwoFactorEmailCode(sessionId: string): Promise<void>
}
