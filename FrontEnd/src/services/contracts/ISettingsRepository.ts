import type { AppointmentSettingModels, ApprovedAppointmentSetting, UpdateSettingsRequest, ViewSettingResponse } from '@/helpers/api/WebApiClient'

export interface ISettingsRepository {
	getSettings(): Promise<ViewSettingResponse[]>
	getAppointmentSettings(): Promise<AppointmentSettingModels>
	getApprovedAppointmentSettings(): Promise<ApprovedAppointmentSetting>
	getGoogleMapSettings(): Promise<string>
	updateSettings(request: UpdateSettingsRequest): Promise<string>
}
