import type { ViewLeadListResponse } from '@/types/crm/lead.types'
import type { PipelineColumnState, PipelineStage } from '@/types/crm/pipeline.types'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import PipelineLeadCard from './PipelineLeadCard'

const CARD_ESTIMATE_SIZE = 164
const CARD_GAP = 12
const VIRTUAL_OVERSCAN = 5
const LOAD_MORE_ROOT_MARGIN = '240px 0px'

interface PipelineColumnProps {
	stage: PipelineStage
	column: PipelineColumnState
	stages: PipelineStage[]
	scrollParent: HTMLElement | null
	canUpdate: boolean
	openMenuLeadId: number | null
	menuRef: Ref<HTMLDivElement>
	onToggleMenu: (leadId: number) => void
	onMoveTo: (lead: ViewLeadListResponse, statusId: number) => void
	onArchive: (lead: ViewLeadListResponse) => void
	onLoadMore: () => void
	onRetry: () => void
}

const PipelineColumn = ({
	stage,
	column,
	stages,
	scrollParent,
	canUpdate,
	openMenuLeadId,
	menuRef,
	onToggleMenu,
	onMoveTo,
	onArchive,
	onLoadMore,
	onRetry,
}: PipelineColumnProps) => {
	const { t } = useTranslation()
	const listRef = useRef<HTMLDivElement | null>(null)
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const scrollMarginRef = useRef(0)
	const loadMoreRef = useRef(onLoadMore)
	loadMoreRef.current = onLoadMore
	const items = column.items
	const canLoadMore = column.hasMore && !column.loadingMore && !column.loadError

	useLayoutEffect(() => {
		if (!listRef.current || !scrollParent) return
		scrollMarginRef.current = listRef.current.getBoundingClientRect().top - scrollParent.getBoundingClientRect().top + scrollParent.scrollTop
	}, [scrollParent, items.length])

	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => scrollParent,
		estimateSize: () => CARD_ESTIMATE_SIZE,
		overscan: VIRTUAL_OVERSCAN,
		gap: CARD_GAP,
		scrollMargin: scrollMarginRef.current,
		getItemKey: (index) => items[index]?.id ?? index,
	})

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel || !scrollParent || !canLoadMore) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) loadMoreRef.current()
			},
			{ root: scrollParent, rootMargin: LOAD_MORE_ROOT_MARGIN, threshold: 0 }
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [canLoadMore, items.length, scrollParent])

	const footerHeight = column.loadingMore || column.loadError ? 48 : 0
	const listHeight = items.length === 0 ? 256 : virtualizer.getTotalSize() + footerHeight
	const virtualItems = virtualizer.getVirtualItems()

	return (
		<Droppable
			droppableId={String(stage.id)}
			type="CARD"
			mode="virtual"
			isDropDisabled={!canUpdate}
			renderClone={(provided, snapshot, rubric) => {
				const lead = items[rubric.source.index]
				if (!lead) return <div ref={provided.innerRef} {...provided.draggableProps} />
				return (
					<PipelineLeadCard
						lead={lead}
						stageId={stage.id}
						stages={stages}
						provided={provided}
						isDragging={snapshot.isDragging}
						canUpdate={canUpdate}
						openMenuLeadId={null}
						menuRef={null}
						onToggleMenu={() => undefined}
						onMoveTo={onMoveTo}
						onArchive={onArchive}
					/>
				)
			}}
		>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.droppableProps}
					className={`flex min-h-[16rem] flex-1 flex-col p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20 dark:bg-primary/10' : ''}`}
				>
					{items.length === 0 ? (
						<div className="flex min-h-[16rem] flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-8 text-center dark:border-gray-600">
							{column.loadingMore ? (
								<div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
									<i className="ri-loader-4-line animate-spin text-base" />
									{t('Common.Loading', 'Loading...')}
								</div>
							) : column.loadError ? (
								<button type="button" className="text-xs font-medium text-primary hover:underline" onClick={onRetry}>
									{t('Common.Retry', 'Retry')}
								</button>
							) : (
								<p className="text-sm text-gray-400 dark:text-gray-500">{t('Manage.SalesPipeline.DropHere', 'Drop leads here')}</p>
							)}
							<div ref={sentinelRef} className="h-px w-full" aria-hidden />
						</div>
					) : (
						<>
							<div ref={listRef} className="relative w-full" style={{ height: listHeight }}>
								{virtualItems.map((virtualRow) => {
									const lead = items[virtualRow.index]
									if (!lead) return null
									return (
										<Draggable key={lead.id} draggableId={String(lead.id)} index={virtualRow.index} isDragDisabled={!canUpdate}>
											{(dragProvided, dragSnapshot) => (
												<PipelineLeadCard
													lead={lead}
													stageId={stage.id}
													stages={stages}
													provided={dragProvided}
													isDragging={dragSnapshot.isDragging}
													style={{ position: 'absolute', top: virtualRow.start - scrollMarginRef.current, left: 0, width: '100%' }}
													canUpdate={canUpdate}
													openMenuLeadId={openMenuLeadId}
													menuRef={menuRef}
													onToggleMenu={onToggleMenu}
													onMoveTo={onMoveTo}
													onArchive={onArchive}
												/>
											)}
										</Draggable>
									)
								})}
								{(column.loadingMore || column.loadError) && (
									<div className="absolute left-0 w-full px-1 py-2 text-center" style={{ top: virtualizer.getTotalSize() }}>
										{column.loadingMore && (
											<div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
												<i className="ri-loader-4-line animate-spin text-base" />
												{t('Common.Loading', 'Loading...')}
											</div>
										)}
										{column.loadError && !column.loadingMore && (
											<button type="button" className="text-xs font-medium text-primary hover:underline" onClick={onRetry}>
												{t('Common.Retry', 'Retry')}
											</button>
										)}
									</div>
								)}
							</div>
							<div ref={sentinelRef} className="h-px w-full" aria-hidden />
						</>
					)}
				</div>
			)}
		</Droppable>
	)
}

export default PipelineColumn
