import { BrandingDetails } from '@/constants'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
	label: string
	link?: string
}
interface PageBreadcrumbsWithLinksProps {
	subNames?: BreadcrumbItem[] // Accept an array of breadcrumb items with labels and optional links
	title: string
	addedChild?: ReactNode
}

const PageBreadcrumbsWithLinks = ({ subNames = [], title, addedChild }: PageBreadcrumbsWithLinksProps) => {
	return (
		<>
			<title>
				{BrandingDetails.PAGE_TITLE_PREFIX} - {title} - {subNames.length > 0 ? subNames[0].label : ''}
			</title>
			<div className="flex justify-between items-center mb-6">
				<div className="flex gap-4">
					<h4 className="text-slate-900 dark:text-slate-200 text-lg font-medium">{title}</h4>
					{addedChild}
				</div>
				<div className="md:flex hidden items-center gap-2.5 font-semibold">
					{/* Render breadcrumb items */}
					{subNames.map((item, idx) => (
						<div className="flex items-center gap-2" key={idx}>
							{idx !== 0 && <i className="ri-arrow-right-s-line text-base text-slate-400 rtl:rotate-180" />}
							{item.link ? (
								<Link to={item.link} className="text-sm font-medium text-slate-700 dark:text-slate-400">
									{item.label}
								</Link>
							) : (
								<span className="text-sm font-medium text-slate-700 dark:text-slate-400">{item.label}</span>
							)}
						</div>
					))}
				</div>
			</div>
		</>
	)
}

export default PageBreadcrumbsWithLinks
