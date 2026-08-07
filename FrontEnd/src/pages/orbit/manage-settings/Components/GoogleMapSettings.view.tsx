import { FormInput, Label, PageBreadcrumbsWithLinks } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import type { TFunction } from 'i18next'
import React from 'react'

type Props = {
	apiKey: string
	validationError: string
	userHasPermission: (p: PermissionTypes) => boolean
	t: TFunction
	onApiKeyChange: (value: string) => void
	handleSave: () => void
}

const GoogleMapSettingsView: React.FC<Props> = ({ apiKey, validationError, userHasPermission, t, onApiKeyChange, handleSave }) => {
	return (
		<div>
			<PageBreadcrumbsWithLinks
				title={t('Manage.GoogleMap.Settings_Heading', 'Google Map Settings')}
				subNames={[
					{ label: t('Manage.GoogleMap.Settings.Administrator_Subtitle', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu },
					{ label: t('Manage.GoogleMap.Settings.Settings_Subtitle', 'Settings'), link: MenuLinks.ManageSettings },
					{ label: t('Manage.GoogleMap.Settings_Breadcrumb', 'Google Map Settings') },
				]}
			/>

			<div className="card rounded-lg overflow-hidden mt-2">
				<div className="px-6 py-4 border-b dark:border-slate-700">
					<h3 className="text-lg font-semibold orbit-body">{t('Manage.GoogleMap.Settings.Card_Heading', 'Google Map API Key')}</h3>
					<p className="text-sm orbit-label-secondary mt-1">{t('Manage.GoogleMap.Settings.Card_Description', 'Configure the Google Maps API key used for address suggestions and location features.')}</p>
				</div>

				<div className="p-6">
					<div className="space-y-1.5 max-w-2xl">
						<Label variant="field">
							{t('Manage.GoogleMap.Settings.ApiKey', 'API Key')}
							<span className="required-asterisk">*</span>
						</Label>
						<FormInput
							type="text"
							value={apiKey}
							onChange={(e) => onApiKeyChange(e.target.value)}
							placeholder={t('Manage.GoogleMap.Settings.ApiKeyPlaceholder', 'Enter Google Map API key')}
							className="w-full form-control form-input"
							name="googleMapApiKey"
						/>
						{validationError && <p className="orbit-field-error">{validationError}</p>}
					</div>
				</div>

				<div className="flex justify-end items-center gap-2 p-5 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-b-xl">
					{userHasPermission(PermissionTypes.Permissions_ManageSettings_Update) && (
						<button className="btn btn-primary hover:bg-primary/90 transition" onClick={handleSave}>
							{t('Manage.GoogleMap.Settings.Update', 'Update')}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default GoogleMapSettingsView
