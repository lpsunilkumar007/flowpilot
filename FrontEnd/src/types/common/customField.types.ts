export const MAX_CUSTOM_FIELDS_PER_ENTITY = 20
export const MAX_CUSTOM_FIELD_LABEL_LENGTH = 100
export const MAX_CUSTOM_FIELD_VALUE_LENGTH = 500

export enum EntityCustomFieldType {
	Lead = 'Lead',
	Task = 'Task',
}

export interface ViewEntityCustomFieldResponse {
	id: number
	entityType: EntityCustomFieldType
	fkEntityPKId: number
	label: string
	value: string
	displayOrder: number
}

export interface EntityCustomFieldItemRequest {
	id?: number
	label?: string
	value?: string
	displayOrder?: number
}
