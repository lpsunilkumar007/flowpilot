import { formatHelper } from '@/helpers/format.helper'
import { LeadActivityType } from '@/types/crm/lead.types'

export const leadCardClass = 'rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'

export const formatLeadStatus = (statusName: string): string => formatHelper.punctuateLabel(statusName)

export const getLeadStatusTone = (statusName: string): 'success' | 'danger' | 'warning' | 'neutral' => {
	if (statusName === 'Won') return 'success'
	if (statusName === 'Lost') return 'danger'
	if (statusName === 'OnHold' || statusName === 'Negotiation') return 'warning'
	return 'neutral'
}

export const isClosedLeadStatus = (statusName: string): boolean => statusName === 'Won' || statusName === 'Lost'

export const getActivityIcon = (type: LeadActivityType | string): string => {
	const key = typeof type === 'string' ? type : LeadActivityType[type as number]
	const map: Record<string, string> = {
		Call: 'ri-phone-line',
		Meeting: 'ri-group-line',
		Demo: 'ri-presentation-line',
		Visit: 'ri-map-pin-line',
		WhatsApp: 'ri-whatsapp-line',
		Email: 'ri-mail-line',
		Proposal: 'ri-file-list-3-line',
		Note: 'ri-sticky-note-line',
		Task: 'ri-checkbox-circle-line',
	}
	return map[key] ?? 'ri-record-circle-line'
}

export const formatActivityType = (type: LeadActivityType | string): string => {
	if (typeof type === 'string') return formatHelper.punctuateLabel(type)
	return formatHelper.punctuateLabel(LeadActivityType[type as number])
}

export type LeadUserLookup = {
	id?: string
	strValue?: string
	text?: string
	firstName?: string
	lastName?: string
	email?: string
}

export const getUserDisplayName = (users: LeadUserLookup[], userId?: string): string => {
	if (!userId) return '—'
	const user = users.find((u) => (u.id ?? u.strValue) === userId)
	if (!user) return userId
	if (user.text?.trim()) return user.text.trim()
	return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || userId
}
