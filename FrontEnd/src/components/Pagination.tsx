import React from 'react'

interface PaginationProps {
	currentPage?: number
	totalPages?: number
	hasPreviousPage?: boolean
	hasNextPage?: boolean
	onPageChange: (pageNumber: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage = 1, totalPages = 1, hasPreviousPage = false, hasNextPage = false, onPageChange }) => {
	const handlePageClick = (pageNumber: number) => {
		if (currentPage !== pageNumber) {
			onPageChange(pageNumber)
		}
	}

	const handlePrevious = () => {
		if (hasPreviousPage && currentPage > 1) {
			onPageChange(currentPage - 1)
		}
	}

	const handleNext = () => {
		if (hasNextPage && currentPage < totalPages) {
			onPageChange(currentPage + 1)
		}
	}

	return (
		<div className="pt-5">
			<div className="gridjs-pagination">
				<div className="gridjs-pages">
					<button role="button" title="First" aria-label="First" onClick={() => handlePageClick(1)} disabled={currentPage === 1}>
						First
					</button>

					<button role="button" title="Previous" aria-label="Previous" onClick={handlePrevious} disabled={!hasPreviousPage}>
						Previous
					</button>

					{Array.from({ length: totalPages }, (_, index) => (
						<button key={index + 1} role="button" className={currentPage === index + 1 ? 'gridjs-currentPage' : ''} title={`Page ${index + 1}`} aria-label={`Page ${index + 1}`} onClick={() => handlePageClick(index + 1)}>
							{index + 1}
						</button>
					))}

					<button role="button" title="Next" aria-label="Next" onClick={handleNext} disabled={!hasNextPage}>
						Next
					</button>

					<button role="button" title="Last" aria-label="Last" onClick={() => handlePageClick(totalPages)} disabled={currentPage === totalPages}>
						Last
					</button>
				</div>
			</div>
		</div>
	)
}

export default Pagination
