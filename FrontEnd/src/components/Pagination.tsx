import React, { useMemo } from 'react'

interface PaginationProps {
	currentPage?: number
	totalPages?: number
	/** Alias used by some callers; same as totalCount. */
	totalItems?: number
	totalCount?: number
	pageSize?: number
	hasPreviousPage?: boolean
	hasNextPage?: boolean
	onPageChange: (pageNumber: number) => void
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function buildPageItems(currentPage: number, totalPages: number, siblingCount = 1): PageItem[] {
	if (totalPages <= 1) {
		return [1]
	}

	// Show all pages when the list is short enough.
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1)
	}

	const firstPage = 1
	const lastPage = totalPages
	const leftSibling = Math.max(currentPage - siblingCount, firstPage + 1)
	const rightSibling = Math.min(currentPage + siblingCount, lastPage - 1)

	const showLeftEllipsis = leftSibling > firstPage + 1
	const showRightEllipsis = rightSibling < lastPage - 1

	const items: PageItem[] = [firstPage]

	if (showLeftEllipsis) {
		items.push('ellipsis-start')
	} else {
		for (let page = firstPage + 1; page < leftSibling; page += 1) {
			items.push(page)
		}
	}

	for (let page = leftSibling; page <= rightSibling; page += 1) {
		items.push(page)
	}

	if (showRightEllipsis) {
		items.push('ellipsis-end')
	} else {
		for (let page = rightSibling + 1; page < lastPage; page += 1) {
			items.push(page)
		}
	}

	items.push(lastPage)
	return items
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage = 1,
	totalPages,
	totalItems,
	totalCount,
	pageSize,
	hasPreviousPage,
	hasNextPage,
	onPageChange,
}) => {
	const safeCurrentPage = Math.max(1, currentPage)

	const resolvedTotalCount = totalCount ?? totalItems
	const derivedTotalPages =
		pageSize != null && pageSize > 0 && resolvedTotalCount != null
			? Math.max(1, Math.ceil(resolvedTotalCount / pageSize))
			: undefined

	const safeTotalPages = Math.max(1, totalPages ?? derivedTotalPages ?? 1)
	const canGoPrevious = hasPreviousPage ?? safeCurrentPage > 1
	const canGoNext = hasNextPage ?? safeCurrentPage < safeTotalPages

	const pageItems = useMemo(() => buildPageItems(safeCurrentPage, safeTotalPages), [safeCurrentPage, safeTotalPages])

	const handlePageClick = (event: React.MouseEvent<HTMLButtonElement>, pageNumber: number) => {
		event.preventDefault()
		event.stopPropagation()
		if (safeCurrentPage !== pageNumber) {
			onPageChange(pageNumber)
		}
	}

	const handlePrevious = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
		event.stopPropagation()
		if (canGoPrevious && safeCurrentPage > 1) {
			onPageChange(safeCurrentPage - 1)
		}
	}

	const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
		event.stopPropagation()
		if (canGoNext && safeCurrentPage < safeTotalPages) {
			onPageChange(safeCurrentPage + 1)
		}
	}

	if (safeTotalPages <= 1) {
		return null
	}

	return (
		<div className="pt-5">
			<div className="gridjs-pagination">
				<div className="gridjs-pages">
					<button type="button" role="button" title="First" aria-label="First" onClick={(event) => handlePageClick(event, 1)} disabled={safeCurrentPage === 1}>
						First
					</button>

					<button type="button" role="button" title="Previous" aria-label="Previous" onClick={handlePrevious} disabled={!canGoPrevious}>
						Previous
					</button>

					{pageItems.map((item) => {
						if (item === 'ellipsis-start' || item === 'ellipsis-end') {
							return (
								<button type="button" key={item} role="button" title="More pages" aria-label="More pages" disabled className="pointer-events-none">
									...
								</button>
							)
						}

						return (
							<button
								type="button"
								key={item}
								role="button"
								className={safeCurrentPage === item ? 'gridjs-currentPage' : ''}
								title={`Page ${item}`}
								aria-label={`Page ${item}`}
								aria-current={safeCurrentPage === item ? 'page' : undefined}
								onClick={(event) => handlePageClick(event, item)}
							>
								{item}
							</button>
						)
					})}

					<button type="button" role="button" title="Next" aria-label="Next" onClick={handleNext} disabled={!canGoNext}>
						Next
					</button>

					<button type="button" role="button" title="Last" aria-label="Last" onClick={(event) => handlePageClick(event, safeTotalPages)} disabled={safeCurrentPage === safeTotalPages}>
						Last
					</button>
				</div>
			</div>
		</div>
	)
}

export default Pagination
