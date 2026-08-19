import { MenuLinks } from '@/constants/menu'
import { leadCardClass } from '@/pages/orbit/manage-leads/helpers/leadDisplay.helper'
import { InterestLevel, type ViewLeadListResponse } from '@/types/crm/lead.types'
import type { PipelineStage } from '@/types/crm/pipeline.types'
import type { DraggableProvided } from '@hello-pangea/dnd'
import type { CSSProperties, Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export const formatPipelineRevenue = (value?: number | null) => {
	if (value == null) return '—'
	if (value >= 1000) {
		const formatted = value / 1000
		return `$${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}k`
	}
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export const getPipelineInitials = (name?: string) => {
	if (!name?.trim()) return '?'
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('')
}

interface PipelineLeadCardProps {
	lead: ViewLeadListResponse
	stageId: number
	stages: PipelineStage[]
	provided: DraggableProvided
	isDragging?: boolean
	style?: CSSProperties
	canUpdate: boolean
	openMenuLeadId: number | null
	menuRef: Ref<HTMLDivElement>
	onToggleMenu: (leadId: number) => void
	onMoveTo: (lead: ViewLeadListResponse, statusId: number) => void
	onArchive: (lead: ViewLeadListResponse) => void
}

const PipelineLeadCard = ({
	lead,
	stageId,
	stages,
	provided,
	isDragging,
	style,
	canUpdate,
	openMenuLeadId,
	menuRef,
	onToggleMenu,
	onMoveTo,
	onArchive,
}: PipelineLeadCardProps) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const editUrl = MenuLinks.EditLead.replace(':id', String(lead.id))

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			style={{ ...style, ...provided.draggableProps.style }}
			className={`${leadCardClass} relative p-4 transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : 'hover:shadow-md'}`}
		>
			<div className="mb-3 flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(editUrl)} onKeyDown={(e) => e.key === 'Enter' && navigate(editUrl)} role="button" tabIndex={0}>
					<p className="truncate font-semibold text-gray-900 dark:text-gray-100">{lead.businessName}</p>
					<p className="truncate text-sm text-gray-500 dark:text-gray-400">{lead.ownerName}</p>
					<p className="truncate text-xs text-gray-400">{lead.offeringName || 'Unassigned'}</p>
				</div>
				<div className="relative" ref={openMenuLeadId === lead.id ? menuRef : undefined}>
					<button
						type="button"
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
						onMouseDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation()
							onToggleMenu(lead.id)
						}}
						aria-label="Lead actions"
					>
						<i className="ri-more-2-fill text-lg" />
					</button>
					{openMenuLeadId === lead.id && (
						<div className="absolute end-0 z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800" onMouseDown={(e) => e.stopPropagation()}>
							<button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => navigate(editUrl)}>
								<i className="ri-pencil-line" />
								{t('Common.Edit', 'Edit')}
							</button>
							{canUpdate && (
								<div className="border-t border-gray-100 py-1 dark:border-gray-700">
									<p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t('Manage.SalesPipeline.MoveTo', 'Move to')}</p>
									{stages
										.filter((stage) => stage.id !== stageId)
										.map((stage) => (
											<button key={stage.id} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => onMoveTo(lead, stage.id)}>
												{stage.label}
											</button>
										))}
								</div>
							)}
							{canUpdate && (
								<button
									type="button"
									className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:border-gray-700 dark:hover:bg-rose-900/20"
									onClick={() => onArchive(lead)}
								>
									<i className="ri-archive-line" />
									{t('Common.Archive', 'Archive')}
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="mb-3 flex flex-wrap gap-1.5">
				<span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-700 dark:text-gray-300">{lead.businessType}</span>
				{lead.interestLevel === InterestLevel.High ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">Hot</span> : null}
			</div>

			<div className="flex items-center justify-between gap-2">
				<p className="text-base font-semibold text-gray-900 dark:text-gray-100">{formatPipelineRevenue(lead.expectedRevenue)}</p>
				<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white" title={lead.ownerName}>
					{getPipelineInitials(lead.ownerName)}
				</span>
			</div>
		</div>
	)
}

export default PipelineLeadCard
