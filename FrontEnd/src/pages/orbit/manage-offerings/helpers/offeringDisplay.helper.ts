import { OfferingStatus, OfferingType } from '@/types/crm/offering.types'

export const offeringCardClass = 'rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800'

type EnumLike = Record<string | number, string | number>

const toEnumRecord = (enumObj: object): EnumLike => enumObj as EnumLike

/** Resolve API enum values that may arrive as number or string name. */
export const enumName = (enumObj: object, value: string | number | null | undefined, fallback: string): string => {
	if (value == null || value === '') return fallback
	const map = toEnumRecord(enumObj)
	if (typeof value === 'string') {
		if (value in map && typeof map[value] === 'number') return value
		const asNum = Number(value)
		if (!Number.isNaN(asNum) && typeof map[asNum] === 'string') return map[asNum] as string
		return value
	}
	const name = map[value]
	return typeof name === 'string' ? name : fallback
}

export const enumNumericValue = (enumObj: object, value: string | number | null | undefined): number | undefined => {
	if (value == null || value === '') return undefined
	const map = toEnumRecord(enumObj)
	if (typeof value === 'number') return value
	if (value in map && typeof map[value] === 'number') return map[value] as number
	const asNum = Number(value)
	if (!Number.isNaN(asNum) && typeof map[asNum] === 'string') return asNum
	return undefined
}

export const toEnumOptionValue = (enumObj: object, value: string | number | null | undefined): string => {
	const numeric = enumNumericValue(enumObj, value)
	return numeric === undefined ? '' : String(numeric)
}

export const isOfferingActive = (status: string | number | null | undefined): boolean =>
	enumNumericValue(OfferingStatus, status) === OfferingStatus.Active

export const formatOfferingTypeLabel = (type: string | number | null | undefined): string =>
	enumName(OfferingType, type, 'Product')

export const formatOfferingStatusLabel = (status: string | number | null | undefined): string =>
	enumName(OfferingStatus, status, 'Active')
