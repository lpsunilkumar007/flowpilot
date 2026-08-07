import {
    InterestLevel,
    LeadActivityType,
    LeadPriority,
} from '@/types/crm/lead.types'

const DATE_FIELDS = new Set(['expectedClosingDate', 'nextFollowUpDate', 'activityDate'])
const OPTIONAL_NUMBER_FIELDS = new Set(['numberOfOutlets', 'expectedMonthlyBilling', 'expectedRevenue', 'durationMinutes'])

const ENUM_FIELD_MAP: Record<string, Record<string, string | number>> = {
	priority: LeadPriority,
	interestLevel: InterestLevel,
	activityType: LeadActivityType,
}

const toEnumName = (enumObj: Record<string, string | number>, value: unknown): unknown => {
	if (value === '' || value === null || value === undefined) return undefined
	if (typeof value === 'string' && Number.isNaN(Number(value))) return value

	const numericValue = typeof value === 'number' ? value : Number(value)
	if (!Number.isNaN(numericValue) && enumObj[numericValue] !== undefined) {
		return enumObj[numericValue]
	}

	return value
}

const normalizeDate = (value: unknown): string | undefined => {
	if (value === '' || value === null || value === undefined) return undefined
	if (typeof value !== 'string') return undefined

	const trimmed = value.trim()
	if (!trimmed) return undefined

	// HTML date input: YYYY-MM-DD — append UTC midnight for DateTimeOffset parsing
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
		return `${trimmed}T00:00:00.000Z`
	}

	return trimmed
}

const applyAssignToYourselfRules = (result: Record<string, unknown>, payload: Record<string, unknown>) => {
	if (!('assignToYourself' in payload) && !('assignedToUserId' in payload)) {
		return
	}

	const assignToYourself = Boolean(payload.assignToYourself)
	result.assignToYourself = assignToYourself

	if (assignToYourself) {
		delete result.assignedToUserId
		return
	}

	const assignedToUserId = payload.assignedToUserId
	if (typeof assignedToUserId === 'string' && assignedToUserId.trim()) {
		result.assignedToUserId = assignedToUserId.trim()
	} else {
		delete result.assignedToUserId
	}
}

/** Cleans form values before sending to Lead API (avoids "" on dates/numbers and numeric enums). */
export const sanitizeLeadApiPayload = <T extends object>(payload: T): T => {
	const source = payload as Record<string, unknown>
	const result: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(source)) {
		if (key === 'assignToYourself' || key === 'assignedToUserId') continue
		if (value === '' || value === null) continue

		if (DATE_FIELDS.has(key)) {
			const dateValue = normalizeDate(value)
			if (dateValue !== undefined) result[key] = dateValue
			continue
		}

		if (OPTIONAL_NUMBER_FIELDS.has(key)) {
			if (value === undefined) continue
			const numericValue = typeof value === 'number' ? value : Number(value)
			if (!Number.isNaN(numericValue)) result[key] = numericValue
			continue
		}

		if (key in ENUM_FIELD_MAP) {
			const enumValue = toEnumName(ENUM_FIELD_MAP[key], value)
			if (enumValue !== undefined) result[key] = enumValue
			continue
		}

		result[key] = value
	}

	applyAssignToYourselfRules(result, source)

	return result as T
}
