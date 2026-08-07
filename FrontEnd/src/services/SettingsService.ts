import { settingsClient } from '@/helpers/api/apiClients'
import type { ISettingsRepository } from './contracts/ISettingsRepository'

/**
 * Settings service - abstraction over settings API client.
 * Use this instead of importing settingsClient directly for better testability.
 */
export const settingsService: ISettingsRepository = {
	getSettings: () => settingsClient.getSettings(),
	getAppointmentSettings: () => settingsClient.getAppointmentSettings(),
	getApprovedAppointmentSettings: () => settingsClient.getApprovedAppointmentSettings(),
	getGoogleMapSettings: () => settingsClient.getGoogleMapSettings(),
	updateSettings: (request) => settingsClient.updateSettings(request),
}
