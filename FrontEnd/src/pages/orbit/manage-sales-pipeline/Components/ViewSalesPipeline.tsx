import ConfirmationModal from '@/components/ConfirmationModal'
import { ModalLayout } from '@/components/HeadlessUI'
import { FormInput } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import { CreateLookUpCodeValueRequest, LookUpCodeTypes, UpdateLookUpCodeValueRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { leadCardClass } from '@/pages/orbit/manage-leads/helpers/leadDisplay.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { leadService } from '@/services/LeadService'
import { offeringService } from '@/services/OfferingService'
import { lookUpService } from '@/services/LookUpService'
import { InterestLevel, LeadFilterType, type UpdateLeadRequest, type ViewLeadDetailResponse, type ViewLeadListResponse } from '@/types/crm/lead.types'
import type { OfferingDropDownItemResponse } from '@/types/crm/offering.types'
import type { PipelineBoardState, PipelineStage } from '@/types/crm/pipeline.types'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

const STAGE_HEADER_CLASSES = ['bg-slate-50 dark:bg-slate-800/60', 'bg-blue-50 dark:bg-blue-900/20', 'bg-indigo-50 dark:bg-indigo-900/20', 'bg-violet-50 dark:bg-violet-900/20', 'bg-amber-50 dark:bg-amber-900/20', 'bg-orange-50 dark:bg-orange-900/20', 'bg-emerald-50 dark:bg-emerald-900/20', 'bg-rose-50 dark:bg-rose-900/20', 'bg-cyan-50 dark:bg-cyan-900/20', 'bg-teal-50 dark:bg-teal-900/20']

const stageKey = (statusId: number) => String(statusId)

const formatRevenue = (value?: number | null) => {
	if (value == null) return '—'
	if (value >= 1000) {
		const formatted = value / 1000
		return `$${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}k`
	}
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

const getInitials = (name?: string) => {
	if (!name?.trim()) return '?'
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase() ?? '')
		.join('')
}

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)
	return result
}

const buildBoard = (stages: PipelineStage[], leads: ViewLeadListResponse[]): PipelineBoardState => {
	const board = stages.reduce((acc, stage) => {
		acc[stageKey(stage.id)] = []
		return acc
	}, {} as PipelineBoardState)

	leads.forEach((lead) => {
		const key = stageKey(lead.leadStatusId)
		if (board[key]) board[key].push(lead)
		else if (stages[0]) board[stageKey(stages[0].id)].push(lead)
	})

	return board
}

const detailToUpdateRequest = (lead: ViewLeadDetailResponse, overrides: Partial<UpdateLeadRequest> = {}): UpdateLeadRequest => ({
	id: lead.id,
	businessName: lead.businessName,
	businessType: lead.businessType,
	currentPOS: lead.currentPOS,
	website: lead.website,
	gstNumber: lead.gstNumber,
	pan: lead.pan,
	numberOfOutlets: lead.numberOfOutlets,
	expectedMonthlyBilling: lead.expectedMonthlyBilling,
	expectedRevenue: lead.expectedRevenue,
	companySize: lead.companySize,
	offeringId: lead.offeringId ?? 0,
	ownerName: lead.ownerName,
	designation: lead.designation,
	mobile: lead.mobile,
	whatsApp: lead.whatsApp,
	email: lead.email,
	alternatePhone: lead.alternatePhone,
	country: lead.country,
	state: lead.state,
	city: lead.city,
	area: lead.area,
	pincode: lead.pincode,
	fullAddress: lead.fullAddress,
	googleMapsLink: lead.googleMapsLink,
	leadSourceId: lead.leadSourceId,
	assignedToUserId: lead.assignedToUserId,
	priority: lead.priority,
	leadStatusId: lead.leadStatusId,
	expectedClosingDate: lead.expectedClosingDate,
	interestLevel: lead.interestLevel,
	painPoints: lead.painPoints,
	competitors: lead.competitors,
	requirements: lead.requirements,
	isArchived: lead.isArchived,
	...overrides,
})

interface ViewSalesPipelineProps {
	reloadKey?: number
}

const ViewSalesPipeline: React.FC<ViewSalesPipelineProps> = ({ reloadKey = 0 }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { userHasPermission } = usePermission()
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageSalePipelines_Update)
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageSalePipelines_Create)
	const canReorderColumns = userHasPermission(PermissionTypes.Permissions_ManageLookUps_Update)
	const canCreateLookup = userHasPermission(PermissionTypes.Permissions_ManageLookUps_Create)
	const canShowColumnMenu = canCreate || canCreateLookup || canReorderColumns
	const queryOfferingUid = searchParams.get('offeringUid') || undefined
	const queryOfferingId = useMemo(() => {
		const value = Number(searchParams.get('offeringId'))
		return Number.isFinite(value) && value > 0 ? value : undefined
	}, [searchParams])

	const [loading, setLoading] = useState(true)
	const [stages, setStages] = useState<PipelineStage[]>([])
	const [board, setBoard] = useState<PipelineBoardState>({})
	const [leadStatusLookUpCodeId, setLeadStatusLookUpCodeId] = useState<number | null>(null)
	const [openMenuLeadId, setOpenMenuLeadId] = useState<number | null>(null)
	const [openColumnMenuId, setOpenColumnMenuId] = useState<number | null>(null)
	const [archiveLead, setArchiveLead] = useState<ViewLeadListResponse | null>(null)
	const [copyListStage, setCopyListStage] = useState<PipelineStage | null>(null)
	const [copyListName, setCopyListName] = useState('')
	const [moveListStage, setMoveListStage] = useState<PipelineStage | null>(null)
	const [moveListPosition, setMoveListPosition] = useState(1)
	const [listActionBusy, setListActionBusy] = useState(false)
	const [offerings, setOfferings] = useState<OfferingDropDownItemResponse[]>([])
	const [offeringId, setOfferingId] = useState<number | undefined>(queryOfferingId)
	const [offeringUniqueId, setOfferingUniqueId] = useState<string | undefined>(queryOfferingUid)
	const menuRef = useRef<HTMLDivElement | null>(null)

	const buildAddLeadUrl = useCallback(() => {
		const selectedOfferingUid = offeringUniqueId ?? offerings.find((offering) => offering.value === offeringId)?.uniqueId
		return selectedOfferingUid ? `${MenuLinks.AddLead}?offeringUid=${encodeURIComponent(selectedOfferingUid)}` : MenuLinks.AddLead
	}, [offeringId, offeringUniqueId, offerings])

	const loadBoard = useCallback(async () => {
		await runWithToast(
			async () => {
				const [statusItems, leadPage, lookUps] = await Promise.all([
					DropDownService.getLookUpCodeValues(LookUpCodeTypes.LeadStatus),
					leadService.search({
						pageNumber: 0,
						pageSize: PagingVariables.DefaultPageSize,
						filterType: LeadFilterType.All,
						...(offeringId ? { offeringId } : {}),
						...(!offeringId && offeringUniqueId ? { offeringUniqueId } : {}),
						sortField: 'CreatedOn',
						sortOrder: 'desc',
					}),
					lookUpService.getLookUpCodes(),
				])

				const leadStatusLookUp = (lookUps ?? []).find((item) => item.lookUpCodeType === LookUpCodeTypes.LeadStatus || String(item.lookUpCodeType) === 'LeadStatus')
				setLeadStatusLookUpCodeId(leadStatusLookUp?.id ?? null)

				const nextStages: PipelineStage[] = (statusItems ?? []).map((item, index) => ({
					id: item.value,
					lookUpValue: item.text,
					label: formatHelper.punctuateLabel(item.text),
					headerClass: STAGE_HEADER_CLASSES[index % STAGE_HEADER_CLASSES.length],
				}))

				setStages(nextStages)
				setBoard(buildBoard(nextStages, leadPage?.data ?? []))
				return leadPage
			},
			{ setLoading }
		)
	}, [offeringId, offeringUniqueId])

	useEffect(() => {
		loadBoard()
	}, [loadBoard, reloadKey])

	useEffect(() => {
		setOfferingId(queryOfferingId)
		setOfferingUniqueId(queryOfferingId ? undefined : queryOfferingUid)
	}, [queryOfferingId, queryOfferingUid])

	useEffect(() => {
		offeringService
			.getActiveDropDown()
			.then((list) => setOfferings(list ?? []))
			.catch(() => setOfferings([]))
	}, [])

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpenMenuLeadId(null)
				setOpenColumnMenuId(null)
			}
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [])

	const moveLeadToStatus = async (lead: ViewLeadListResponse, destStatusId: number, destIndex?: number) => {
		if (lead.leadStatusId === destStatusId) return

		const sourceKey = stageKey(lead.leadStatusId)
		const destKey = stageKey(destStatusId)
		const destStage = stages.find((stage) => stage.id === destStatusId)

		const previousBoard = board
		setBoard((current) => {
			const sourceItems = Array.from(current[sourceKey] ?? []).filter((item) => item.id !== lead.id)
			const destItems = Array.from(current[destKey] ?? []).filter((item) => item.id !== lead.id)
			const moved = {
				...lead,
				leadStatusId: destStatusId,
				leadStatusName: destStage?.lookUpValue ?? lead.leadStatusName,
			}
			const insertAt = destIndex ?? destItems.length
			destItems.splice(insertAt, 0, moved)
			return { ...current, [sourceKey]: sourceItems, [destKey]: destItems }
		})
		setOpenMenuLeadId(null)

		const result = await runWithToast(() => leadService.updateStatus(lead.id, { leadStatusId: destStatusId }), {
			onSuccess: () => messageHelper.showSuccess(t('Manage.SalesPipeline.StatusUpdated', 'Lead status updated')),
		})

		if (!result.ok) setBoard(previousBoard)
	}

	const persistColumnOrder = async (orderedStages: PipelineStage[]) => {
		const previousStages = stages
		const nextStages = orderedStages.map((stage, index) => ({
			...stage,
			headerClass: STAGE_HEADER_CLASSES[index % STAGE_HEADER_CLASSES.length],
		}))
		setStages(nextStages)
		setOpenColumnMenuId(null)

		const result = await runWithToast(
			() =>
				Promise.all(
					nextStages.map((stage, index) =>
						lookUpService.updateLookUpCodeValue(
							new UpdateLookUpCodeValueRequest({
								id: stage.id,
								lookUpValue: stage.lookUpValue,
								displayOrder: index,
								isActive: true,
							})
						)
					)
				),
			{
				onSuccess: () => messageHelper.showSuccess(t('Manage.SalesPipeline.ColumnOrderUpdated', 'Pipeline order updated')),
			}
		)

		if (!result.ok) setStages(previousStages)
	}

	const openCopyList = (stage: PipelineStage) => {
		setOpenColumnMenuId(null)
		setCopyListStage(stage)
		setCopyListName(`${stage.label} (copy)`)
	}

	const openMoveList = (stage: PipelineStage) => {
		const currentIndex = stages.findIndex((s) => s.id === stage.id)
		setOpenColumnMenuId(null)
		setMoveListStage(stage)
		setMoveListPosition(currentIndex >= 0 ? currentIndex + 1 : 1)
	}

	const onCreateCopiedList = async () => {
		if (!copyListStage || !leadStatusLookUpCodeId) {
			messageHelper.showError(t('Manage.SalesPipeline.LookupMissing', 'Lead Status lookup is not configured.'))
			return
		}

		const name = copyListName.trim()
		if (!name) {
			messageHelper.showError(t('Manage.SalesPipeline.ListNameRequired', 'List name is required.'))
			return
		}

		const lookUpValue = name.replace(/\s+/g, '')
		if (stages.some((s) => s.lookUpValue.toLowerCase() === lookUpValue.toLowerCase())) {
			messageHelper.showError(t('Manage.SalesPipeline.ListExists', 'A list with this name already exists.'))
			return
		}

		const sourceIndex = stages.findIndex((s) => s.id === copyListStage.id)

		await runWithToast(
			async () => {
				await lookUpService.createLookUpCodeValue(
					new CreateLookUpCodeValueRequest({
						lookUpValue,
						displayOrder: stages.length,
						lookUpCodeId: leadStatusLookUpCodeId,
						isActive: true,
					})
				)

				const [statusItems, leadPage] = await Promise.all([
					DropDownService.getLookUpCodeValues(LookUpCodeTypes.LeadStatus),
					leadService.search({
						pageNumber: 0,
						pageSize: PagingVariables.DefaultPageSize,
						filterType: LeadFilterType.All,
						...(offeringId ? { offeringId } : {}),
						...(!offeringId && offeringUniqueId ? { offeringUniqueId } : {}),
						sortField: 'CreatedOn',
						sortOrder: 'desc',
					}),
				])

				let nextStages: PipelineStage[] = (statusItems ?? []).map((item, index) => ({
					id: item.value,
					lookUpValue: item.text,
					label: formatHelper.punctuateLabel(item.text),
					headerClass: STAGE_HEADER_CLASSES[index % STAGE_HEADER_CLASSES.length],
				}))

				const newIndex = nextStages.findIndex((s) => s.lookUpValue.toLowerCase() === lookUpValue.toLowerCase())
				const targetIndex = sourceIndex >= 0 ? sourceIndex + 1 : nextStages.length - 1
				if (newIndex >= 0 && newIndex !== targetIndex) {
					nextStages = reorder(nextStages, newIndex, Math.min(targetIndex, nextStages.length - 1))
					await Promise.all(
						nextStages.map((stage, index) =>
							lookUpService.updateLookUpCodeValue(
								new UpdateLookUpCodeValueRequest({
									id: stage.id,
									lookUpValue: stage.lookUpValue,
									displayOrder: index,
									isActive: true,
								})
							)
						)
					)
					nextStages = nextStages.map((stage, index) => ({
						...stage,
						headerClass: STAGE_HEADER_CLASSES[index % STAGE_HEADER_CLASSES.length],
					}))
				}

				setStages(nextStages)
				setBoard(buildBoard(nextStages, leadPage?.data ?? []))
				return true
			},
			{
				setLoading: setListActionBusy,
				onSuccess: () => {
					messageHelper.showSuccess(t('Manage.SalesPipeline.ListCopied', 'List created'))
					setCopyListStage(null)
				},
			}
		)
	}

	const onMoveListConfirm = async () => {
		if (!moveListStage) return
		const fromIndex = stages.findIndex((s) => s.id === moveListStage.id)
		const toIndex = Math.min(Math.max(moveListPosition - 1, 0), stages.length - 1)
		if (fromIndex < 0 || fromIndex === toIndex) {
			setMoveListStage(null)
			return
		}

		setListActionBusy(true)
		const nextStages = reorder(stages, fromIndex, toIndex)
		await persistColumnOrder(nextStages)
		setListActionBusy(false)
		setMoveListStage(null)
	}

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, type } = result
		if (!destination) return

		if (type === 'COLUMN') {
			if (!canReorderColumns || source.index === destination.index) return
			const nextStages = reorder(stages, source.index, destination.index)
			await persistColumnOrder(nextStages)
			return
		}

		if (!canUpdate) return

		const sourceKey = source.droppableId
		const destKey = destination.droppableId

		if (sourceKey === destKey) {
			setBoard((current) => ({
				...current,
				[sourceKey]: reorder(current[sourceKey] ?? [], source.index, destination.index),
			}))
			return
		}

		const lead = board[sourceKey]?.[source.index]
		if (!lead) return
		await moveLeadToStatus(lead, Number(destKey), destination.index)
	}

	const onArchiveConfirm = async () => {
		if (!archiveLead) return
		const leadId = archiveLead.id

		const result = await runWithToast(
			async () => {
				const detail = await leadService.getById(leadId)
				return leadService.update(leadId, detailToUpdateRequest(detail, { isArchived: true }))
			},
			{
				onSuccess: () => {
					messageHelper.showSuccess(t('Manage.SalesPipeline.Archived', 'Lead archived'))
					setBoard((current) => {
						const next = { ...current }
						Object.keys(next).forEach((key) => {
							next[key] = next[key].filter((item) => item.id !== leadId)
						})
						return next
					})
				},
			}
		)

		if (result.ok) setArchiveLead(null)
	}

	if (loading) return <AnimationSkeleton />

	if (stages.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-gray-600">
				<p className="text-sm text-gray-500 dark:text-gray-400">{t('Manage.SalesPipeline.NoStatuses', 'No active Lead Status values found. Add them under Lookups.')}</p>
			</div>
		)
	}

	return (
		<div className="w-full min-w-0">
			<div className="mb-4 flex flex-wrap items-end gap-3">
				<FormInput label={t('Manage.Leads.Filter_Offering', 'Offering')} name="pipelineOfferingId" type="bottom-sheet" className="form-select min-w-[220px]" value={offeringId ?? ''} onChange={(e) => {
					setOfferingUniqueId(undefined)
					setOfferingId(e.target.value ? Number(e.target.value) : undefined)
				}}>
					<option value="">{t('Common.All', 'All')}</option>
					{offerings.map((offering) => (
						<option key={offering.value} value={offering.value}>
							{offering.text}
						</option>
					))}
				</FormInput>
			</div>
			{/*
			  Single scroll container only — @hello-pangea/dnd does not support nested
			  scroll parents (e.g. board overflow-x + Droppable overflow-y).
			*/}
			<DragDropContext onDragEnd={onDragEnd}>
				<div className="h-[calc(100vh-16rem)] min-h-[32rem] w-full min-w-0 overflow-auto pipeline-scroll">
					<Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
						{(boardProvided) => (
							<div ref={boardProvided.innerRef} {...boardProvided.droppableProps} className="inline-flex min-h-full min-w-full items-start gap-4 pb-2">
								{stages.map((stage, stageIndex) => {
									const leads = board[stageKey(stage.id)] ?? []
									const stageTotal = leads.reduce((sum, lead) => sum + (lead.expectedRevenue ?? 0), 0)

									return (
										<Draggable key={stage.id} draggableId={`column-${stage.id}`} index={stageIndex} isDragDisabled={!canReorderColumns}>
											{(colProvided, colSnapshot) => (
												<div ref={colProvided.innerRef} {...colProvided.draggableProps} className={`flex w-[300px] shrink-0 flex-col rounded-xl border border-gray-200/80 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/40 ${colSnapshot.isDragging ? 'shadow-xl ring-2 ring-primary/30' : ''}`}>
													<div {...colProvided.dragHandleProps} className={`rounded-t-xl border-b border-gray-200/80 px-4 py-3 dark:border-gray-700 ${stage.headerClass} ${canReorderColumns ? 'cursor-grab active:cursor-grabbing' : ''}`}>
														<div className="flex items-center justify-between gap-2">
															<div className="flex min-w-0 items-center gap-2">
																{canReorderColumns && <i className="ri-draggable shrink-0 text-base text-gray-400" aria-hidden="true" />}
																<h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.label}</h3>
																<span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">{leads.length}</span>
															</div>
															<div className="flex shrink-0 items-center gap-1">
																<span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{formatRevenue(stageTotal)}</span>
																{canShowColumnMenu && (
																	<div className="relative" ref={openColumnMenuId === stage.id ? menuRef : undefined}>
																		<button
																			type="button"
																			className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-white/80 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
																			onMouseDown={(e) => e.stopPropagation()}
																			onClick={(e) => {
																				e.stopPropagation()
																				setOpenMenuLeadId(null)
																				setOpenColumnMenuId((prev) => (prev === stage.id ? null : stage.id))
																			}}
																			aria-label={t('Manage.SalesPipeline.ListActions', 'List actions')}
																		>
																			<i className="ri-more-fill text-lg" />
																		</button>
																		{openColumnMenuId === stage.id && (
																			<div className="absolute end-0 z-30 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800" onMouseDown={(e) => e.stopPropagation()}>
																				<div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
																					<p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{t('Manage.SalesPipeline.ListActions', 'List actions')}</p>
																					<button type="button" className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" onClick={() => setOpenColumnMenuId(null)} aria-label={t('Common.Close', 'Close')}>
																						<i className="ri-close-line text-base" />
																					</button>
																				</div>
																				{canCreate && (
																					<button
																						type="button"
																						className="flex w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
																						onClick={() => {
																							setOpenColumnMenuId(null)
																							navigate(buildAddLeadUrl())
																						}}
																					>
																						{t('Manage.SalesPipeline.AddCard', 'Add card')}
																					</button>
																				)}
																				{canCreateLookup && (
																					<button type="button" className="flex w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => openCopyList(stage)}>
																						{t('Manage.SalesPipeline.CopyList', 'Copy list')}
																					</button>
																				)}
																				{canReorderColumns && (
																					<button type="button" className="flex w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => openMoveList(stage)}>
																						{t('Manage.SalesPipeline.MoveList', 'Move list')}
																					</button>
																				)}
																			</div>
																		)}
																	</div>
																)}
															</div>
														</div>
													</div>

													<Droppable droppableId={stageKey(stage.id)} type="CARD" isDropDisabled={!canUpdate}>
														{(provided, snapshot) => (
															<div ref={provided.innerRef} {...provided.droppableProps} className={`flex min-h-[20rem] flex-1 flex-col gap-3 p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20 dark:bg-primary/10' : ''}`}>
																{leads.length === 0 ? (
																	<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 px-3 py-8 text-center dark:border-gray-600">
																		<p className="text-sm text-gray-400 dark:text-gray-500">{t('Manage.SalesPipeline.DropHere', 'Drop leads here')}</p>
																	</div>
																) : (
																	leads.map((lead, index) => (
																		<Draggable key={lead.id} draggableId={String(lead.id)} index={index} isDragDisabled={!canUpdate}>
																			{(dragProvided, dragSnapshot) => (
																				<div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} className={`${leadCardClass} relative p-4 transition-shadow ${dragSnapshot.isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : 'hover:shadow-md'}`}>
																					<div className="mb-3 flex items-start justify-between gap-2">
																						<div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(MenuLinks.EditLead.replace(':id', String(lead.id)))} onKeyDown={(e) => e.key === 'Enter' && navigate(MenuLinks.EditLead.replace(':id', String(lead.id)))} role="button" tabIndex={0}>
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
																									setOpenColumnMenuId(null)
																									setOpenMenuLeadId((prev) => (prev === lead.id ? null : lead.id))
																								}}
																								aria-label="Lead actions"
																							>
																								<i className="ri-more-2-fill text-lg" />
																							</button>
																							{openMenuLeadId === lead.id && (
																								<div className="absolute end-0 z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800" onMouseDown={(e) => e.stopPropagation()}>
																									<button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => navigate(MenuLinks.EditLead.replace(':id', String(lead.id)))}>
																										<i className="ri-pencil-line" />
																										{t('Common.Edit', 'Edit')}
																									</button>
																									{canUpdate && (
																										<div className="border-t border-gray-100 py-1 dark:border-gray-700">
																											<p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t('Manage.SalesPipeline.MoveTo', 'Move to')}</p>
																											{stages
																												.filter((s) => s.id !== stage.id)
																												.map((s) => (
																													<button key={s.id} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => moveLeadToStatus(lead, s.id)}>
																														{s.label}
																													</button>
																												))}
																										</div>
																									)}
																									{canUpdate && (
																										<button
																											type="button"
																											className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:border-gray-700 dark:hover:bg-rose-900/20"
																											onClick={() => {
																												setOpenMenuLeadId(null)
																												setArchiveLead(lead)
																											}}
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
																						<p className="text-base font-semibold text-gray-900 dark:text-gray-100">{formatRevenue(lead.expectedRevenue)}</p>
																						<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white" title={lead.ownerName}>
																							{getInitials(lead.ownerName)}
																						</span>
																					</div>
																				</div>
																			)}
																		</Draggable>
																	))
																)}
																{provided.placeholder}
															</div>
														)}
													</Droppable>
												</div>
											)}
										</Draggable>
									)
								})}
								{boardProvided.placeholder}
							</div>
						)}
					</Droppable>
				</div>
			</DragDropContext>

			<ConfirmationModal isOpen={!!archiveLead} onClose={() => setArchiveLead(null)} onConfirm={onArchiveConfirm} title={t('Manage.SalesPipeline.ArchiveTitle', 'Archive lead')} description={t('Manage.SalesPipeline.ArchiveDesc', 'Archive this lead and remove it from the pipeline board?')} confirmButtonText={t('Common.Archive', 'Archive')} variant="warning" />

			<ModalLayout showModal={!!copyListStage} toggleModal={() => setCopyListStage(null)} panelClassName="!min-h-0 w-[min(360px,95vw)] bg-white p-0 shadow-xl dark:bg-gray-800" placement="justify-center items-center p-4">
				<div className="rounded-lg">
					<div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
						<button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setCopyListStage(null)} aria-label={t('Common.Back', 'Back')}>
							<i className="ri-arrow-left-s-line text-xl" />
						</button>
						<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('Manage.SalesPipeline.CopyList', 'Copy list')}</h3>
						<button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setCopyListStage(null)} aria-label={t('Common.Close', 'Close')}>
							<i className="ri-close-line text-xl" />
						</button>
					</div>
					<div className="space-y-3 p-4">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Manage.SalesPipeline.ListName', 'Name')}</label>
						<textarea className="form-input min-h-[88px] w-full resize-y" value={copyListName} onChange={(e) => setCopyListName(e.target.value)} autoFocus />
						<button type="button" className="btn btn-primary" disabled={listActionBusy} onClick={onCreateCopiedList}>
							{t('Manage.SalesPipeline.CreateList', 'Create list')}
						</button>
					</div>
				</div>
			</ModalLayout>

			<ModalLayout showModal={!!moveListStage} toggleModal={() => setMoveListStage(null)} panelClassName="!min-h-0 w-[min(360px,95vw)] bg-white p-0 shadow-xl dark:bg-gray-800" placement="justify-center items-center p-4">
				<div className="rounded-lg">
					<div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
						<button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setMoveListStage(null)} aria-label={t('Common.Back', 'Back')}>
							<i className="ri-arrow-left-s-line text-xl" />
						</button>
						<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('Manage.SalesPipeline.MoveList', 'Move list')}</h3>
						<button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setMoveListStage(null)} aria-label={t('Common.Close', 'Close')}>
							<i className="ri-close-line text-xl" />
						</button>
					</div>
					<div className="space-y-3 p-4">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Manage.SalesPipeline.Position', 'Position')}</label>
						<select className="form-select w-full" value={moveListPosition} onChange={(e) => setMoveListPosition(Number(e.target.value))}>
							{stages.map((_, index) => (
								<option key={index + 1} value={index + 1}>
									{index + 1}
								</option>
							))}
						</select>
						<button type="button" className="btn btn-primary" disabled={listActionBusy} onClick={onMoveListConfirm}>
							{t('Manage.SalesPipeline.Move', 'Move')}
						</button>
					</div>
				</div>
			</ModalLayout>
		</div>
	)
}

export default ViewSalesPipeline
