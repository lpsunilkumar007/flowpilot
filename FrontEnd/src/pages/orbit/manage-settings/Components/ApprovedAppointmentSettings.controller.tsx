import { ApprovedAppointmentSetting, MailDto, UpdateSettingsRequest } from '@/helpers/api/WebApiClient'
import { settingsService } from '@/services/SettingsService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import ValidationHelper from '@/helpers/validation.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ApprovedAppointmentSettingsView, { MailDtoErrors, MailDtoValidation } from './ApprovedAppointmentSettings.view'

const ApprovedAppointmentSettings: React.FC = () => {
	const { t } = useTranslation()
	const [data, setData] = useState<ApprovedAppointmentSetting>()
	const [validationErrors, setValidationErrors] = useState<MailDtoValidation>({})
	const { id } = useParams()
	const { userHasPermission } = usePermission()

	const initValidationErrors = () => {
		const mailErrors: MailDtoErrors = { subject: '', body: '' }
		const keys = ['appointmentConfirmedEmailForParticipant', 'appointmentConfirmedEmailForHost']

		const next: MailDtoValidation = {}
		keys.forEach((k) => {
			next[k] = { ...mailErrors }
		})
		setValidationErrors(next)
	}

	const fetchData = async () => {
		const response = await settingsService.getApprovedAppointmentSettings()
		setData(response)
	}

	useEffect(() => {
		initValidationErrors()
		fetchData()
	}, [])

	const validateForm = async () => {
		let isValid = true
		const newErrors: MailDtoValidation = {}

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

			newErrors[key] = mailErrors
		}

		validateMailDto(data?.appointmentConfirmedEmailForParticipant, 'appointmentConfirmedEmailForParticipant')
		validateMailDto(data?.appointmentConfirmedEmailForHost, 'appointmentConfirmedEmailForHost')

		setValidationErrors(newErrors)
		return isValid
	}

	const handleSave = async () => {
		const isFormValid = await validateForm()
		if (!isFormValid || !data) return

		const updateSettingsRequest = new UpdateSettingsRequest({
			id: Number(id),
			settingJson: JSON.stringify(data),
		})
		await runWithToast(() => settingsService.updateSettings(updateSettingsRequest), {
			onSuccess: (response) => messageHelper.showSuccess(response as any),
		})
	}

	const handleChange = (path: string[], value: any) => {
		if (!data) return

		const updatedData = JSON.parse(JSON.stringify(data))
		let current: any = updatedData
		for (let i = 0; i < path.length - 1; i++) {
			if (!current[path[i]]) current[path[i]] = {}
			current = current[path[i]]
		}
		current[path[path.length - 1]] = value
		setData(updatedData)
	}

	const handleReminderBeforeDaysChange = (value: number) => {
		if (!data) return
		setData({ ...data, reminderBeforeDays: value } as ApprovedAppointmentSetting)
	}

	const handleLastReminderBeforeMinuteChange = (value: number) => {
		if (!data) return
		setData({ ...data, lastReminderBeforeMinute: value } as ApprovedAppointmentSetting)
	}

	return (
		<ApprovedAppointmentSettingsView
			id={id}
			data={data}
			validationErrors={validationErrors}
			userHasPermission={userHasPermission}
			t={t}
			handleSave={handleSave}
			handleChange={handleChange}
			handleReminderBeforeDaysChange={handleReminderBeforeDaysChange}
			handleLastReminderBeforeMinuteChange={handleLastReminderBeforeMinuteChange}
		/>
	)
}

export default ApprovedAppointmentSettings

