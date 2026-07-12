import { Label } from '@/components'
import { UpdateTwoFactorAuthenticationDetailsRequest, ViewUserTwoFactorAuthenticationDetailsResponse, UserTwoFactorAuthenticationTypes } from '@/helpers/api/WebApiClient'
import { messageHelper } from '@/helpers/message.helper'
import { personalService } from '@/services/PersonalService'
import withSuspense from '@/helpers/suspense.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmationModal from '@/components/ConfirmationModal'

const EnableAuthenticator = withSuspense(lazy(() => import('./EnableAuthenticator')))
const UserTwoFactorAuthentication = () => {
	const { t } = useTranslation()
	const loadingIndicator = () => <AnimationSkeleton />
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [data, setData] = useState<ViewUserTwoFactorAuthenticationDetailsResponse | null>(null)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [methodToSwitch, setMethodToSwitch] = useState<UserTwoFactorAuthenticationTypes | null>(null)
	const [pendingType, setPendingType] = useState<UserTwoFactorAuthenticationTypes | null>(null)
	const [qrCode, setQrCode] = useState<string | null>(null)
	const [secretKey, setSecretKey] = useState<string | null>(null)
	const isEnabled = !!data?.isTwoFactorAuthenticationEnabled

	const normalizeType = (enabled: boolean, type?: UserTwoFactorAuthenticationTypes) => {
		if (!enabled) return UserTwoFactorAuthenticationTypes.None
		if (type === undefined || type === null || type === UserTwoFactorAuthenticationTypes.None) return UserTwoFactorAuthenticationTypes.Email
		return type
	}

	const twoFactorType = normalizeType(isEnabled, data?.userTwoFactorAuthenticationType)

	const statusBadge = useMemo(() => {
		return isEnabled ? <span className="orbit-2fa-status orbit-2fa-status--enabled">{t('Manage.Profile.TwoFactor.Enabled', 'Enabled')}</span> : <span className="orbit-2fa-status orbit-2fa-status--disabled">{t('Manage.Profile.TwoFactor.Disabled', 'Disabled')}</span>
	}, [isEnabled, t])

	const load = async () => {
		setLoading(true)
		try {
			const res = await personalService.getTwoFactorAuthenticationDetails()
			setData(res)
			setPendingType(null)
			setQrCode(null)
			setSecretKey(null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const saveTwoFactor = async (nextEnabled: boolean, nextType?: UserTwoFactorAuthenticationTypes) => {
		setSaving(true)

		try {
			const typeToSend = normalizeType(nextEnabled, nextType ?? data?.userTwoFactorAuthenticationType)

			const response = await personalService.updateTwoFactorAuthenticationDetails(
				new UpdateTwoFactorAuthenticationDetailsRequest({
					isTwoFactorAuthenticationEnabled: nextEnabled,
					userTwoFactorAuthenticationType: typeToSend,
				})
			)

			await load()
			return response
		} finally {
			setSaving(false)
		}
	}

	const onSelectEmail = async () => {
		if (!isEnabled) return

		const currentSelected = pendingType ?? twoFactorType
		if (currentSelected === UserTwoFactorAuthenticationTypes.Email) return

		setMethodToSwitch(UserTwoFactorAuthenticationTypes.Email)
		setIsConfirmOpen(true)
	}

	const onSelectAuthenticator = async () => {
		if (!isEnabled) return
		const currentSelected = pendingType ?? twoFactorType
		if (currentSelected === UserTwoFactorAuthenticationTypes.Authenticator) return

		setMethodToSwitch(UserTwoFactorAuthenticationTypes.Authenticator)
		setIsConfirmOpen(true)
	}

	const handleConfirmChange = async () => {
		if (!methodToSwitch) return

		if (methodToSwitch === UserTwoFactorAuthenticationTypes.Email) {
			if (twoFactorType === UserTwoFactorAuthenticationTypes.Email) {
				setPendingType(null)
			} else {
				await saveTwoFactor(true, UserTwoFactorAuthenticationTypes.Email)
			}
		} else if (methodToSwitch === UserTwoFactorAuthenticationTypes.Authenticator) {
			setPendingType(UserTwoFactorAuthenticationTypes.Authenticator)

			if (!qrCode) {
				try {
					const res = await personalService.generateAuthenticator()
					setQrCode(res.qrCodeImageUrl.fileBase64String)
					setSecretKey(res.secretKey)
				} catch (err: any) {
					messageHelper.showError(err)
				}
			}
		}
		setMethodToSwitch(null)
		setIsConfirmOpen(false)
	}
	const selectedType = pendingType ?? twoFactorType

	const isAuthenticatorPending = isEnabled && selectedType === UserTwoFactorAuthenticationTypes.Authenticator && twoFactorType !== UserTwoFactorAuthenticationTypes.Authenticator

	const handleAuthenticatorVerified = async () => {
		const response = await saveTwoFactor(true, UserTwoFactorAuthenticationTypes.Authenticator)
		messageHelper.showSuccess(response || t('Manage.Profile.TwoFactor.Authenticator.Success', 'Authenticator app enabled successfully.'))
	}

	return (
		<div className="card p-6 mb-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h4 className="card-title mb-1">{t('Manage.Profile.TwoFactor.Title', 'Two-Factor Authentication')}</h4>
					<p className="text-sm orbit-muted">{t('Manage.Profile.TwoFactor.Help', 'Add an extra layer of security to your account. You’ll be asked for a verification code when signing in.')}</p>
				</div>

				{!loading && statusBadge}
			</div>

			<div className="pt-5">
				{loading ? (
					loadingIndicator()
				) : data ? (
					<>
						<div className="rounded-lg border border-gray-200 p-4">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<div>
									<div className="font-medium">{isEnabled ? t('Manage.Profile.TwoFactor.StateOn', '2FA is currently enabled') : t('Manage.Profile.TwoFactor.StateOff', '2FA is currently disabled')}</div>
									<div className="text-sm orbit-muted mt-1">{isEnabled ? t('Manage.Profile.TwoFactor.OnDesc', 'Your account is protected with an additional verification step.') : t('Manage.Profile.TwoFactor.OffDesc', 'Enable 2FA to reduce the risk of unauthorized access.')}</div>
								</div>

								<button type="button" onClick={() => saveTwoFactor(!isEnabled)} disabled={saving} className={`btn text-white w-full sm:w-auto ${isEnabled ? 'bg-gray-700' : 'bg-primary'}`}>
									{saving ? t('Common.Saving', 'Saving...') : isEnabled ? t('Manage.Profile.TwoFactor.BtnDisable', 'Disable 2FA') : t('Manage.Profile.TwoFactor.BtnEnable', 'Enable 2FA')}
								</button>
							</div>
						</div>

						{isEnabled && (
							<div className="rounded-lg border border-gray-200 p-4 mt-4">
								<div className="font-medium mb-2">{t('Manage.Profile.TwoFactor.Method', 'Authentication method')}</div>

								<Label variant="card" as="label" className="flex items-start gap-3 p-3 rounded-md border orbit-panel cursor-pointer">
									<input type="radio" name="twoFactorMethod" checked={selectedType === UserTwoFactorAuthenticationTypes.Email} onChange={onSelectEmail} className="mt-1 focus:ring-0 focus:outline-none focus:ring-offset-0" disabled={saving} />
									<div>
										<div className="font-medium">{t('Manage.Profile.TwoFactor.Email', 'Email verification')}</div>
										<p className="text-sm orbit-muted">{t('Manage.Profile.TwoFactor.EmailDesc', 'Receive a one-time verification code via email.')}</p>
									</div>
								</Label>

								<Label variant="card" as="label" className="mt-3 flex items-start gap-3 p-3 rounded-md border orbit-panel cursor-pointer">
									<input type="radio" name="twoFactorMethod" checked={selectedType === UserTwoFactorAuthenticationTypes.Authenticator} onChange={onSelectAuthenticator} className="mt-1 focus:ring-0 focus:outline-none focus:ring-offset-0" disabled={saving} />
									<div className="flex-1">
										<div className="font-medium">{t('Manage.Profile.TwoFactor.Authenticator', 'Authenticator app')}</div>
										<p className="text-sm orbit-muted">{t('Manage.Profile.TwoFactor.AuthenticatorDesc', 'Use an authenticator app such as Google Authenticator or Microsoft Authenticator.')}</p>

										{isAuthenticatorPending && (
											<div className="mt-3">
												<EnableAuthenticator sharedKey={secretKey} qrCode={qrCode} onVerified={handleAuthenticatorVerified} />
											</div>
										)}
									</div>
								</Label>
							</div>
						)}
					</>
				) : null}
			</div>

			<ConfirmationModal
				isOpen={isConfirmOpen}
				onClose={() => {
					setIsConfirmOpen(false)
					setMethodToSwitch(null)
				}}
				onConfirm={handleConfirmChange}
				title={`${t('Manage.Profile.TwoFactor.ConfirmMethodChange_Heading', 'Change 2FA Method')}`}
				description={`${t('Manage.Profile.TwoFactor.ConfirmMethodChange', '2FA is currently enabled. Are you sure you want to change the authentication method?')}`}
				confirmButtonText={`${t('Manage.Profile.TwoFactor.ConfirmMethodChange_ConfirmButtonText', 'Change Method')}`}
			/>
		</div>
	)
}

export default UserTwoFactorAuthentication
