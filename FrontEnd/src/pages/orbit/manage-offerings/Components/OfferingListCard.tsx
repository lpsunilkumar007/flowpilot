import ActionDropdown from '@/components/ActionDropdown'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import type { ViewOfferingResponse } from '@/types/crm/offering.types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { formatOfferingTypeLabel, isOfferingActive, offeringCardClass } from '../helpers/offeringDisplay.helper'

interface OfferingListCardProps {
	offering: ViewOfferingResponse
	ownerName: string
	canUpdate: boolean
	canDelete: boolean
	canCreateLead: boolean
	canViewLeads: boolean
	canViewPipeline: boolean
	onEdit: () => void
	onToggleStatus: () => void
	onDelete: () => void
}

const buildOfferingUrl = (baseUrl: string, offeringUniqueId: string) => `${baseUrl}?offeringUid=${encodeURIComponent(offeringUniqueId)}`

const OfferingListCard: React.FC<OfferingListCardProps> = ({
	offering,
	ownerName,
	canUpdate,
	canDelete,
	canCreateLead,
	canViewLeads,
	canViewPipeline,
	onEdit,
	onToggleStatus,
	onDelete,
}) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const isActive = isOfferingActive(offering.status)
	const typeLabel = formatOfferingTypeLabel(offering.type)

	return (
		<div className={offeringCardClass}>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="truncate text-base font-semibold text-gray-800 dark:text-gray-100">{offering.name}</h3>
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
							{typeLabel === 'Project' ? t('Manage.Offerings.Type_Project', 'Project') : t('Manage.Offerings.Type_Product', 'Product')}
						</span>
						<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
							{isActive ? t('Common.Active', 'Active') : t('Common.Inactive', 'Inactive')}
						</span>
					</div>
					<p className="mt-2 line-clamp-2 text-sm text-gray-500">{offering.description || t('Manage.Offerings.NoDescription', 'No description')}</p>
				</div>
				<ActionDropdown
					label={t('Common.Action', 'Action')}
					menuWidth={160}
					minWidthPx={160}
					items={[
						{ key: 'edit', label: t('Common.Edit', 'Edit'), onClick: onEdit, permission: PermissionTypes.Permissions_ManageOfferings_Update, disabled: !canUpdate },
						{ key: 'status', label: isActive ? t('Common.Deactivate', 'Deactivate') : t('Common.Activate', 'Activate'), onClick: onToggleStatus, permission: PermissionTypes.Permissions_ManageOfferings_Update, disabled: !canUpdate },
						{ key: 'delete', label: t('Common.Delete', 'Delete'), onClick: onDelete, permission: PermissionTypes.Permissions_ManageOfferings_Delete, disabled: !canDelete },
					]}
				/>
			</div>
			<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div>
					<p className="text-xs text-gray-400">{t('Manage.Offerings.Owner', 'Owner')}</p>
					<p className="truncate font-medium text-gray-700 dark:text-gray-200">{ownerName}</p>
				</div>
				<div>
					<p className="text-xs text-gray-400">{t('Manage.Offerings.Leads', 'Leads')}</p>
					<p className="font-medium text-gray-700 dark:text-gray-200">{offering.leadCount}</p>
				</div>
				<div className="col-span-2">
					<p className="text-xs text-gray-400">{t('Manage.Offerings.ExpectedValue', 'Expected value')}</p>
					<p className="font-medium text-gray-700 dark:text-gray-200">
						{offering.expectedValueFrom || offering.expectedValueTo
							? `${offering.expectedValueFrom ?? 0} - ${offering.expectedValueTo ?? 0}`
							: t('Common.NotAvailable', 'N/A')}
					</p>
				</div>
			</div>
			<div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
				{isActive && canCreateLead && (
					<button
						type="button"
						className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
						title={t('Manage.Offerings.Action_AddLead', 'Add Lead')}
						aria-label={t('Manage.Offerings.Action_AddLead', 'Add Lead')}
						onClick={() => navigate(buildOfferingUrl(MenuLinks.AddLead, offering.uniqueId))}
					>
						<i className="ri-user-add-line text-lg" />
					</button>
				)}
				{canViewLeads && (
					<button
						type="button"
						className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						title={t('Manage.Offerings.Action_ViewLeads', 'View Leads')}
						aria-label={t('Manage.Offerings.Action_ViewLeads', 'View Leads')}
						onClick={() => navigate(buildOfferingUrl(MenuLinks.ManageLeads, offering.uniqueId))}
					>
						<i className="ri-group-line text-lg" />
					</button>
				)}
				{canViewPipeline && (
					<button
						type="button"
						className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						title={t('Manage.Offerings.Action_ViewPipeline', 'View Pipeline')}
						aria-label={t('Manage.Offerings.Action_ViewPipeline', 'View Pipeline')}
						onClick={() => navigate(buildOfferingUrl(MenuLinks.SalesPipeline, offering.uniqueId))}
					>
						<i className="ri-funds-line text-lg" />
					</button>
				)}
			</div>
		</div>
	)
}

export default OfferingListCard
