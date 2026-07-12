import { AppointmentColorSetting, AppointmentSettingModels, MailDto, UpdateSettingsRequest } from '@/helpers/api/WebApiClient'
import { settingsService } from '@/services/SettingsService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import ValidationHelper from '@/helpers/validation.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppointmentSettingsView, { MailDtoErrors, MailDtoValidation } from './AppointmentSettings.view'

const ManageAppointmentSettings: React.FC = () => {
	const { t } = useTranslation()
	const [data, setData] = useState<AppointmentSettingModels>()
	const [validationErrors, setValidationErrors] = useState<MailDtoValidation>({})
	const { id } = useParams()
	const { userHasPermission } = usePermission()

	const initValidationErrors = () => {
		const mailErrors: MailDtoErrors = { subject: '', body: '' }
		const keys = ['appointmentCreatedEmail', 'appointmentCreatedReminderEmail']

		const next: MailDtoValidation = {}
		keys.forEach((k) => {
			next[k] = { ...mailErrors }
		})

		setValidationErrors(next)
	}

	const fetchData = async () => {
		const response = await settingsService.getAppointmentSettings()
		setData(response)
	}

	useEffect(() => {
		initValidationErrors()
		fetchData()
	}, [])

	const validateForm = async () => {
		initValidationErrors()
		let isValid = true

		const validateMailDto = (model: MailDto | undefined, key: string) => {
			if (!model) return

			const mailErrors: MailDtoErrors = { subject: '', body: '' }

			if (!model.subject || model.subject.trim() === '') {
				mailErrors.subject = 'Subject is required.'
				isValid = false
			}

			if (!model.body || model.body.trim() === '' || ValidationHelper.isEditorBodyBlank(model.body)) {
				mailErrors.body = 'Body is required.'
				isValid = false
			}

			setValidationErrors((prev) => ({ ...prev, [key]: mailErrors }))
		}

		validateMailDto(data?.appointmentCreatedEmail, 'appointmentCreatedEmail')
		validateMailDto(data?.appointmentCreatedReminderEmail, 'appointmentCreatedReminderEmail')
		return isValid
	}

	const handleSave = async () => {
		const isFormValid = await validateForm()
		if (!isFormValid) return

		if (data) {
			const updateSettingsRequest = new UpdateSettingsRequest({
				id: Number(id),
				settingJson: JSON.stringify(data),
			})
			await runWithToast(() => settingsService.updateSettings(updateSettingsRequest), {
				onSuccess: (response) => messageHelper.showSuccess(response as any),
			})
		}
	}

	const handleChange = (path: string[], value: any) => {
		if (!data) return

		const updatedData = AppointmentSettingModels.fromJS(data)
		let current: any = updatedData
		for (let i = 0; i < path.length - 1; i++) {
			if (!current[path[i]]) current[path[i]] = {}
			current = current[path[i]]
		}
		current[path[path.length - 1]] = value
		setData(updatedData)
	}

	const handleReminderDaysChange = (index: number, value: number) => {
		if (!data) return
		const updatedReminders = [...(data.reminderAfterDays || [])]
		updatedReminders[index] = value
		setData({ ...data, reminderAfterDays: updatedReminders } as AppointmentSettingModels)
	}

	const handleAddMore = () => {
		if (!data) return
		setData({ ...data, reminderAfterDays: [...(data.reminderAfterDays || []), 0] } as AppointmentSettingModels)
	}

	const handleDelete = (index: number) => {
		if (!data) return
		const updatedReminders = data.reminderAfterDays && data.reminderAfterDays.filter((_, i) => i !== index)
		setData({ ...data, reminderAfterDays: updatedReminders && updatedReminders.length > 0 ? updatedReminders : [0] } as AppointmentSettingModels)
	}

	const handleIncludeFinalReminderChange = (value: boolean) => {
		if (!data) return
		setData({ ...data, includeFinalReminderBeforeAppointment: value } as AppointmentSettingModels)
	}

	const handleAutoAppointmentCancelEnabledChange = (value: boolean) => {
		if (!data) return
		setData({ ...data, isAutoAppointmentCancelEnabled: value } as AppointmentSettingModels)
	}

	const handleColorSettingChange = (index: number, field: 'appointmentStatus' | 'backgroundColor', value: any) => {
		if (!data) return
		const currentList = [...(data.appointmentColorSetting || [])]
		const existingItem = currentList[index]

		const itemData = existingItem ? { appointmentStatus: existingItem.appointmentStatus, backgroundColor: existingItem.backgroundColor, [field]: value } : { [field]: value }

		const updatedItem = AppointmentColorSetting.fromJS(itemData)
		currentList[index] = updatedItem

		setData({ ...data, appointmentColorSetting: currentList } as AppointmentSettingModels)
	}

	return <AppointmentSettingsView id={id} data={data} validationErrors={validationErrors} userHasPermission={userHasPermission} t={t} handleSave={handleSave} handleChange={handleChange} handleReminderDaysChange={handleReminderDaysChange} handleAddMore={handleAddMore} handleDelete={handleDelete} handleIncludeFinalReminderChange={handleIncludeFinalReminderChange} handleAutoAppointmentCancelEnabledChange={handleAutoAppointmentCancelEnabledChange} handleColorSettingChange={handleColorSettingChange} />
}

export default ManageAppointmentSettings
