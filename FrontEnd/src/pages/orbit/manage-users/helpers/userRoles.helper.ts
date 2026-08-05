import { formatHelper } from '@/helpers/format.helper'

/** System-seeded role names (UserFriendlyRoleName / roleName without tenant prefix). */
export const DEFAULT_SYSTEM_ROLES = ['Admin', 'SalesManager', 'SalesRepresentative', 'Basic'] as const

export const isDefaultSystemRole = (roleName?: string | null): boolean => {
	if (!roleName) return false
	return (DEFAULT_SYSTEM_ROLES as readonly string[]).includes(roleName)
}

/** Display labels for seeded sales roles (and PascalCase custom names). */
export const formatRoleDisplayName = (roleName?: string | null): string => {
	if (!roleName) return ''
	if (roleName === 'Basic') return 'Sales Representative'
	return formatHelper.punctuateLabel(roleName)
}

export const getUserFullName = (user?: { firstName?: string; lastName?: string } | null): string => {
	if (!user) return ''
	return `${user.firstName || ''} ${user.lastName || ''}`.trim()
}

export const resolveReportsToName = (
	users: { id?: string; firstName?: string; lastName?: string }[],
	reportsToUserId?: string | null
): string => {
	if (!reportsToUserId) return '—'
	const manager = users.find((u) => u.id === reportsToUserId)
	const name = getUserFullName(manager)
	return name || '—'
}
