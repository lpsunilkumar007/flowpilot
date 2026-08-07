import { UpdateSettingsRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { settingsService } from '@/services/SettingsService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import GoogleMapSettingsView from './GoogleMapSettings.view'

const GoogleMapSettings: React.FC = () => {
	const { t } = useTranslation()
	const [apiKey, setApiKey] = useState('')
	const [validationError, setValidationError] = useState('')
	const { id } = useParams()
	const { userHasPermission } = usePermission()

	const fetchData = async () => {
		const response = await settingsService.getGoogleMapSettings()
		setApiKey(response ?? '')
	}

	useEffect(() => {
		fetchData()
	}, [])

	const validateForm = () => {
		if (!apiKey || apiKey.trim() === '') {
			setValidationError(t('Manage.GoogleMap.Settings.ApiKeyRequired', 'Google Map API key is required.'))
			return false
		}

		setValidationError('')
		return true
	}

	const handleSave = async () => {
		if (!validateForm()) return

		const updateSettingsRequest = new UpdateSettingsRequest({
			id: Number(id),
			settingJson: JSON.stringify(apiKey.trim()),
		})

		await runWithToast(() => settingsService.updateSettings(updateSettingsRequest), {
			onSuccess: (response) => messageHelper.showSuccess(response as any),
		})
	}

	return (
		<GoogleMapSettingsView
			apiKey={apiKey}
			validationError={validationError}
			userHasPermission={userHasPermission}
			t={t}
			onApiKeyChange={setApiKey}
			handleSave={handleSave}
		/>
	)
}

export default GoogleMapSettings
