/**
 * Pre-configured NSwag API clients with authenticated fetch.
 * Use these instead of instantiating clients directly (e.g. new UsersClient()).
 */

import config from '../../config'
import { authenticatedFetch } from './httpClient'
import {
	AppointmentRequestClient,
	DataControllersClient,
	EmailLogClient,
	EmailTemplateClient,
	FormDesignerClient,
	LeadClient,
	LocalizationClient,
	LookUpClient,
	MultiTenantClient,
	MyTeamClient,
	NexusLookUpClient,
	ParticipantRequestClient,
	PersonalClient,
	RolesClient,
	SettingsClient,
	SubscriptionClient,
	TaskClient,
	TokensClient,
	UsersClient,
} from './WebApiClient'

const baseUrl = config.API_URL
const http = { fetch: authenticatedFetch }

// Singleton instances - clients are stateless, safe to reuse
export const appointmentRequestClient = new AppointmentRequestClient(baseUrl, http)
export const dataControllersClient = new DataControllersClient(baseUrl, http)
export const emailLogClient = new EmailLogClient(baseUrl, http)
export const emailTemplateClient = new EmailTemplateClient(baseUrl, http)
export const formDesignerClient = new FormDesignerClient(baseUrl, http)
export const leadClient = new LeadClient(baseUrl, http)
export const localizationClient = new LocalizationClient(baseUrl, http)
export const lookUpClient = new LookUpClient(baseUrl, http)
export const multiTenantClient = new MultiTenantClient(baseUrl, http)
export const myTeamClient = new MyTeamClient(baseUrl, http)
export const nexusLookUpClient = new NexusLookUpClient(baseUrl, http)
export const participantRequestClient = new ParticipantRequestClient(baseUrl, http)
export const personalClient = new PersonalClient(baseUrl, http)
export const rolesClient = new RolesClient(baseUrl, http)
export const settingsClient = new SettingsClient(baseUrl, http)
export const subscriptionClient = new SubscriptionClient(baseUrl, http)
export const taskClient = new TaskClient(baseUrl, http)
export const tokensClient = new TokensClient(baseUrl, http)
export const usersClient = new UsersClient(baseUrl, http)
