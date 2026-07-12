import type { AppointmentSettingModels, ApprovedAppointmentSetting, UpdateSettingsRequest, ViewSettingResponse } from '@/helpers/api/WebApiClient'

export interface ISettingsRepository {
	getSettings(): Promise<ViewSettingResponse[]>
	getAppointmentSettings(): Promise<AppointmentSettingModels>
	getApprovedAppointmentSettings(): Promise<ApprovedAppointmentSetting>
	updateSettings(request: UpdateSettingsRequest): Promise<string>
}
