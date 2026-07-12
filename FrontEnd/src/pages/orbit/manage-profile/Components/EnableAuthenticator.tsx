import { Label } from '@/components'
import { messageHelper } from '@/helpers/message.helper'
import { personalService } from '@/services/PersonalService'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type EnableAuthenticatorProps = {
	sharedKey?: string | null // for later; optional for now
	qrCode?: string | null
	onVerified?: () => Promise<void> | void
}

const EnableAuthenticator = ({ sharedKey = 'ABCDEF123456', qrCode, onVerified }: EnableAuthenticatorProps) => {
	const { t } = useTranslation()
	const [code, setCode] = useState('')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [verifying, setVerifying] = useState(false)

	const handleVerify = async () => {
		const trimmedCode = code.trim()
		if (!trimmedCode) {
			setErrorMessage(t('Manage.Profile.TwoFactor.Authenticator.CodeRequired', 'Verification code is required.'))
			return
		}

		setVerifying(true)
		setErrorMessage(null)

		try {
			const isValid = await personalService.verifyAuthenticator(trimmedCode)
			if (isValid) {
				if (onVerified) {
					await onVerified()
				}
				setCode('')
			} else {
				setErrorMessage(t('Manage.Profile.TwoFactor.Authenticator.InvalidCode', 'The verification code is incorrect.'))
			}
		} catch (err) {
			console.error(err)
			messageHelper.showError(t('Manage.Profile.TwoFactor.Authenticator.VerifyFailed', 'Unable to verify the authenticator code right now.'))
		} finally {
			setVerifying(false)
		}
	}
	return (
		<>
			<div className="rounded-md orbit-info-panel text-sm orbit-link-emphasis">
				<div className="p-4">
					<p className="mb-3">{t('Manage.Profile.TwoFactor.Authenticator.Intro', 'To use an authenticator app, go through the following steps:')}</p>

					<ol className="list-decimal list-inside space-y-3">
						<li>
							{t('Manage.Profile.TwoFactor.Authenticator.Step1', 'Download a two-factor authenticator app like')} <strong>Microsoft Authenticator</strong>{' '}
							<a href="https://go.microsoft.com/fwlink/?Linkid=825072" target="_blank" rel="noreferrer" className="text-primary underline">
								Android
							</a>{' '}
							/{' '}
							<a href="https://go.microsoft.com/fwlink/?Linkid=825073" target="_blank" rel="noreferrer" className="text-primary underline">
								iOS
							</a>{' '}
							{t('Common.Or', 'or')} <strong>Google Authenticator</strong>{' '}
							<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en" target="_blank" rel="noreferrer" className="text-primary underline">
								Android
							</a>{' '}
							/{' '}
							<a href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8" target="_blank" rel="noreferrer" className="text-primary underline">
								iOS
							</a>
							.
						</li>

						<li>
							{t('Manage.Profile.TwoFactor.Authenticator.Step2', 'Scan the QR code or enter this key')} <kbd className="px-3 py-2 bg-gray-900 text-white rounded font-mono">{sharedKey}</kbd> {t('Manage.Profile.TwoFactor.Authenticator.Step2Suffix', 'into your authenticator app. Spaces and casing do not matter.')}
							{/* <div className="mt-4 flex justify-center">
								<div className="flex items-center justify-center w-56 h-56 border border-dashed border-gray-400 rounded orbit-surface orbit-placeholder text-sm">{t('Manage.Profile.TwoFactor.Authenticator.QRCode', 'QR Code')}</div>
							</div> */}
							<div className="mt-4 flex justify-center">{qrCode ? <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-56 h-56" /> : <div className="flex items-center justify-center w-56 h-56 border border-dashed border-gray-400 rounded text-sm">Loading QR...</div>}</div>
						</li>

						<li>{t('Manage.Profile.TwoFactor.Authenticator.Step3', 'Once configured, your authenticator app will provide a verification code. Enter it below.')}</li>
					</ol>
				</div>

				<div className="flex justify-center m-5">
					<div className="mt-3 max-w-sm w-full card p-4">
						<Label variant="field" className="mb-1">
							{t('Manage.Profile.TwoFactor.Authenticator.VerificationCode', 'Verification code')}
						</Label>
						<input
							type="text"
							name="authenticatorCode"
							value={code}
							onChange={(e) => {
								setCode(e.target.value)
								if (errorMessage) {
									setErrorMessage(null)
								}
							}}
							placeholder={t('Manage.Profile.TwoFactor.Authenticator.CodePlaceholder', 'Enter 6-digit code')}
							className={`form-input w-full ${errorMessage ? 'border-red-500 focus:border-red-500 text-red-700' : ''}`}
							autoComplete="off"
						/>
						{errorMessage && <p className="text-help">{errorMessage}</p>}

						<button type="button" className="btn btn-primary w-full mt-3" onClick={handleVerify} disabled={verifying}>
							{verifying ? t('Common.Saving', 'Saving...') : t('Manage.Profile.TwoFactor.BtnVerify', 'Verify')}
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

export default EnableAuthenticator
