import ConfirmationModal from '@/components/ConfirmationModal'
import { ModalLayout } from '@/components/HeadlessUI'
import { FormInput } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { CreateLookUpCodeValueRequest, LookUpCodeTypes, UpdateLookUpCodeValueRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { leadService } from '@/services/LeadService'
import { lookUpService } from '@/services/LookUpService'
import { LeadFilterType, type SearchLeadRequest, type UpdateLeadRequest, type ViewLeadDetailResponse, type ViewLeadListResponse } from '@/types/crm/lead.types'
import type { OfferingDropDownItemResponse } from '@/types/crm/offering.types'
import {
	emptyPipelineColumn,
	pipelineColumnFromPage,
	PIPELINE_COLUMN_PAGE_SIZE,
	type PipelineBoardState,
	type PipelineColumnState,
	type PipelineStage,
} from '@/types/crm/pipeline.types'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PipelineColumn from './PipelineColumn'
import { formatPipelineRevenue } from './PipelineLeadCard'

const STAGE_HEADER_CLASSES = ['bg-slate-50 dark:bg-slate-800/60', 'bg-blue-50 dark:bg-blue-900/20', 'bg-indigo-50 dark:bg-indigo-900/20', 'bg-violet-50 dark:bg-violet-900/20', 'bg-amber-50 dark:bg-amber-900/20', 'bg-orange-50 dark:bg-orange-900/20', 'bg-emerald-50 dark:bg-emerald-900/20', 'bg-rose-50 dark:bg-rose-900/20', 'bg-cyan-50 dark:bg-cyan-900/20', 'bg-teal-50 dark:bg-teal-900/20']

const stageKey = (statusId: number) => String(statusId)

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)
	return result
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
	const [offeringUniqueId, setOfferingUniqueId] = useState<string | undefined>(queryOfferingId ? undefined : queryOfferingUid)
	const menuRef = useRef<HTMLDivElement | null>(null)
	const boardRef = useRef(board)
	const requestGenRef = useRef<Record<string, number>>({})
	const [boardScrollEl, setBoardScrollEl] = useState<HTMLElement | null>(null)
	boardRef.current = board

	const bumpRequestGen = (key: string) => {
		requestGenRef.current[key] = (requestGenRef.current[key] ?? 0) + 1
		return requestGenRef.current[key]
	}

	const buildAddLeadUrl = useCallback(() => {
		const selectedOfferingUid = offeringUniqueId ?? offerings.find((offering) => offering.value === offeringId)?.uniqueId
		return selectedOfferingUid ? `${MenuLinks.AddLead}?offeringUid=${encodeURIComponent(selectedOfferingUid)}` : MenuLinks.AddLead
	}, [offeringId, offeringUniqueId, offerings])

	const buildColumnSearch = useCallback(
		(statusId: number, pageNumber: number): SearchLeadRequest => {
			if (!Number.isFinite(statusId) || statusId <= 0) {
				throw new Error('LeadStatusId is required for pipeline column search')
			}
			return {
				pageNumber,
				pageSize: PIPELINE_COLUMN_PAGE_SIZE,
				filterType: LeadFilterType.All,
				leadStatusId: statusId,
				sortField: 'CreatedOn',
				sortOrder: 'desc',
				...(offeringId ? { offeringId } : {}),
				...(!offeringId && offeringUniqueId ? { offeringUniqueId } : {}),
			}
		},
		[offeringId, offeringUniqueId]
	)

	const loadColumnPage = useCallback(
		async (statusId: number, pageNumber: number, mode: 'replace' | 'append') => {
			if (!Number.isFinite(statusId) || statusId <= 0) return
			const key = stageKey(statusId)
			const current = boardRef.current[key] ?? emptyPipelineColumn()
			if (mode === 'append' && (current.loadingMore || !current.hasMore)) return

			const gen = bumpRequestGen(key)
			if (mode === 'append') {
				setBoard((prev) => ({
					...prev,
					[key]: { ...(prev[key] ?? emptyPipelineColumn()), loadingMore: true, loadError: false },
				}))
			}

			try {
				const page = await leadService.search(buildColumnSearch(statusId, pageNumber))
				if (requestGenRef.current[key] !== gen) return

				setBoard((prev) => {
					const col = prev[key] ?? emptyPipelineColumn()
					if (mode === 'replace') return { ...prev, [key]: pipelineColumnFromPage(page) }

					const existingIds = new Set(col.items.map((item) => item.id))
					const appended = (page.data ?? []).filter((item) => !existingIds.has(item.id))
					const items = [...col.items, ...appended]
					const totalCount = page.totalCount ?? col.totalCount
					return {
						...prev,
						[key]: {
							items,
							pageNumber: page.currentPage ?? pageNumber,
							totalCount,
							hasMore: page.hasNextPage ?? items.length < totalCount,
							loadingMore: false,
							loadError: false,
						},
					}
				})
			} catch {
				if (requestGenRef.current[key] !== gen) return
				setBoard((prev) => ({
					...prev,
					[key]: { ...(prev[key] ?? emptyPipelineColumn()), loadingMore: false, loadError: true },
				}))
			}
		},
		[buildColumnSearch]
	)

	const loadMoreColumn = useCallback(
		(statusId: number) => {
			const col = boardRef.current[stageKey(statusId)]
			if (!col || col.loadingMore || !col.hasMore || col.loadError) return
			void loadColumnPage(statusId, col.pageNumber + 1, 'append')
		},
		[loadColumnPage]
	)

	const retryColumn = useCallback(
		(statusId: number) => {
			const col = boardRef.current[stageKey(statusId)] ?? emptyPipelineColumn()
			const nextPage = col.items.length === 0 ? 1 : col.pageNumber + 1
			void loadColumnPage(statusId, nextPage, col.items.length === 0 ? 'replace' : 'append')
		},
		[loadColumnPage]
	)

	const loadBoard = useCallback(async () => {
		await runWithToast(
			async () => {
				const [statusItems, lookUps] = await Promise.all([DropDownService.getLookUpCodeValues(LookUpCodeTypes.LeadStatus), lookUpService.getLookUpCodes()])

				const leadStatusLookUp = (lookUps ?? []).find((item) => item.lookUpCodeType === LookUpCodeTypes.LeadStatus || String(item.lookUpCodeType) === 'LeadStatus')
				setLeadStatusLookUpCodeId(leadStatusLookUp?.id ?? null)

				const nextStages: PipelineStage[] = (statusItems ?? [])
					.map((item, index) => ({
						id: Number(item.value),
						lookUpValue: item.text,
						label: formatHelper.punctuateLabel(item.text),
						headerClass: STAGE_HEADER_CLASSES[index % STAGE_HEADER_CLASSES.length],
					}))
					.filter((stage) => Number.isFinite(stage.id) && stage.id > 0)

				setStages(nextStages)

				const pending = nextStages.map((stage) => {
					const key = stageKey(stage.id)
					const gen = bumpRequestGen(key)
					return { key, gen, promise: leadService.search(buildColumnSearch(stage.id, 1)) }
				})

				const results = await Promise.allSettled(pending.map((item) => item.promise))
				const nextBoard: PipelineBoardState = {}
				results.forEach((result, index) => {
					const { key, gen } = pending[index]
					if (requestGenRef.current[key] !== gen) return
					nextBoard[key] = result.status === 'fulfilled' ? pipelineColumnFromPage(result.value) : { ...emptyPipelineColumn(), loadError: true }
				})
				setBoard(nextBoard)
				return true
			},
			{ setLoading }
		)
	}, [buildColumnSearch])

	useEffect(() => {
		loadBoard()
	}, [loadBoard, reloadKey])

	useEffect(() => {
		setOfferingId(queryOfferingId)
		setOfferingUniqueId(queryOfferingId ? undefined : queryOfferingUid)
	}, [queryOfferingId, queryOfferingUid])

	useEffect(() => {
		DropDownService.getActiveOfferings()
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

	const patchColumns = (sourceKey: string, destKey: string, sourceCol: PipelineColumnState, destCol: PipelineColumnState) => {
		setBoard((current) => ({
			...current,
			[sourceKey]: sourceCol,
			[destKey]: destCol,
		}))
	}

	const moveLeadToStatus = async (lead: ViewLeadListResponse, destStatusId: number, destIndex?: number) => {
		if (lead.leadStatusId === destStatusId) return

		const sourceKey = stageKey(lead.leadStatusId)
		const destKey = stageKey(destStatusId)
		const destStage = stages.find((stage) => stage.id === destStatusId)
		const previousSource = boardRef.current[sourceKey] ?? emptyPipelineColumn()
		const previousDest = boardRef.current[destKey] ?? emptyPipelineColumn()

		const sourceItems = previousSource.items.filter((item) => item.id !== lead.id)
		const destItems = previousDest.items.filter((item) => item.id !== lead.id)
		const moved = {
			...lead,
			leadStatusId: destStatusId,
			leadStatusName: destStage?.lookUpValue ?? lead.leadStatusName,
		}
		const insertAt = destIndex ?? destItems.length
		destItems.splice(insertAt, 0, moved)

		patchColumns(
			sourceKey,
			destKey,
			{ ...previousSource, items: sourceItems, totalCount: Math.max(0, previousSource.totalCount - 1) },
			{ ...previousDest, items: destItems, totalCount: previousDest.totalCount + 1 }
		)
		setOpenMenuLeadId(null)

		const result = await runWithToast(() => leadService.updateStatus(lead.id, { leadStatusId: destStatusId }), {
			onSuccess: () => messageHelper.showSuccess(t('Manage.SalesPipeline.StatusUpdated', 'Lead status updated')),
		})

		if (!result.ok) patchColumns(sourceKey, destKey, previousSource, previousDest)
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

				const statusItems = await DropDownService.getLookUpCodeValues(LookUpCodeTypes.LeadStatus)

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
				setBoard((prev) => {
					const next = { ...prev }
					nextStages.forEach((stage) => {
						const key = stageKey(stage.id)
						if (!next[key]) next[key] = emptyPipelineColumn()
					})
					return next
				})
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
			setBoard((current) => {
				const col = current[sourceKey]
				if (!col) return current
				return {
					...current,
					[sourceKey]: { ...col, items: reorder(col.items, source.index, destination.index) },
				}
			})
			return
		}

		const lead = boardRef.current[sourceKey]?.items[source.index]
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
							const col = next[key]
							const items = col.items.filter((item) => item.id !== leadId)
							if (items.length === col.items.length) return
							next[key] = { ...col, items, totalCount: Math.max(0, col.totalCount - 1) }
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
				<FormInput
					label={t('Manage.Leads.Filter_Offering', 'Offering')}
					name="pipelineOfferingId"
					type="bottom-sheet"
					className="form-select min-w-[220px]"
					value={offeringId ?? ''}
					onChange={(e) => {
						setOfferingUniqueId(undefined)
						setOfferingId(e.target.value ? Number(e.target.value) : undefined)
					}}
				>
					<option value="">{t('Common.All', 'All')}</option>
					{offerings.map((offering) => (
						<option key={offering.value} value={offering.value}>
							{offering.text}
						</option>
					))}
				</FormInput>
			</div>
			<DragDropContext onDragEnd={onDragEnd}>
				<div ref={setBoardScrollEl} className="h-[calc(100vh-16rem)] min-h-[32rem] w-full min-w-0 overflow-auto pipeline-scroll">
					<Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
						{(boardProvided) => (
							<div ref={boardProvided.innerRef} {...boardProvided.droppableProps} className="inline-flex min-h-full min-w-full items-stretch gap-4 pb-2">
								{stages.map((stage, stageIndex) => {
									const column = board[stageKey(stage.id)] ?? emptyPipelineColumn()
									const stageTotal = column.items.reduce((sum, lead) => sum + (lead.expectedRevenue ?? 0), 0)

									return (
										<Draggable key={stage.id} draggableId={`column-${stage.id}`} index={stageIndex} isDragDisabled={!canReorderColumns}>
											{(colProvided, colSnapshot) => (
												<div
													ref={colProvided.innerRef}
													{...colProvided.draggableProps}
													className={`flex min-h-full w-[300px] shrink-0 flex-col rounded-xl border border-gray-200/80 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/40 ${colSnapshot.isDragging ? 'shadow-xl ring-2 ring-primary/30' : ''}`}
												>
													<div
														{...colProvided.dragHandleProps}
														className={`sticky top-0 z-10 rounded-t-xl border-b border-gray-200/80 px-4 py-3 dark:border-gray-700 ${stage.headerClass} ${canReorderColumns ? 'cursor-grab active:cursor-grabbing' : ''}`}
													>
														<div className="flex items-center justify-between gap-2">
															<div className="flex min-w-0 items-center gap-2">
																{canReorderColumns && <i className="ri-draggable shrink-0 text-base text-gray-400" aria-hidden="true" />}
																<h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.label}</h3>
																<span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">{column.totalCount}</span>
															</div>
															<div className="flex shrink-0 items-center gap-1">
																<span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{formatPipelineRevenue(stageTotal)}</span>
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

													<PipelineColumn
														stage={stage}
														column={column}
														stages={stages}
														scrollParent={boardScrollEl}
														canUpdate={canUpdate}
														openMenuLeadId={openMenuLeadId}
														menuRef={menuRef}
														onToggleMenu={(leadId) => {
															setOpenColumnMenuId(null)
															setOpenMenuLeadId((prev) => (prev === leadId ? null : leadId))
														}}
														onMoveTo={(lead, statusId) => {
															void moveLeadToStatus(lead, statusId)
														}}
														onArchive={(lead) => {
															setOpenMenuLeadId(null)
															setArchiveLead(lead)
														}}
														onLoadMore={() => loadMoreColumn(stage.id)}
														onRetry={() => retryColumn(stage.id)}
													/>
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
