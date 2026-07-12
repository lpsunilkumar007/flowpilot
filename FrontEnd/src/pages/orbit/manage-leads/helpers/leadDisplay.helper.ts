import { LeadActivityType, LeadStatus } from '@/types/crm/lead.types'
import { formatHelper } from '@/helpers/format.helper'

export const leadCardClass = 'rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'

export const formatLeadStatus = (status: LeadStatus | string): string => {
	if (typeof status === 'string') return formatHelper.punctuateLabel(status)
	return formatHelper.punctuateLabel(LeadStatus[status] ?? String(status))
}

export const getLeadStatusTone = (status: LeadStatus | string): 'success' | 'danger' | 'warning' | 'neutral' => {
	const label = typeof status === 'string' ? status : LeadStatus[status]
	if (label === 'Won') return 'success'
	if (label === 'Lost') return 'danger'
	if (label === 'OnHold' || label === 'Negotiation') return 'warning'
	return 'neutral'
}

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

export const getUserDisplayName = (users: { id?: string; firstName?: string; lastName?: string; email?: string }[], userId?: string): string => {
	if (!userId) return '—'
	const user = users.find((u) => u.id === userId)
	if (!user) return userId
	return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || userId
}
