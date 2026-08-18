import Pagination from '@/components/Pagination'
import { MenuLinks } from '@/constants/menu'
import { PagingVariables } from '@/constants/paging'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { campaignService } from '@/services/CampaignService'
import { CampaignType, type ViewCampaignResponse } from '@/types/crm/campaign.types'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const formatCampaignDate = (value?: string) => (value ? formatHelper.DateTimeFormat(moment(value).toDate()) : '')

const ViewCampaigns: React.FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [loading, setLoading] = useState(true)
	const [campaigns, setCampaigns] = useState<ViewCampaignResponse[]>([])
	const [searchText, setSearchText] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [hasPreviousPage, setHasPreviousPage] = useState(false)
	const [hasNextPage, setHasNextPage] = useState(false)
	const [totalCount, setTotalCount] = useState(0)

	const fetchCampaigns = useCallback(
		async (pageNumber: number, overrides?: { searchText?: string }) => {
			await runWithToast(
				async () => {
					const res = await campaignService.search({
						pageNumber,
						pageSize: PagingVariables.DefaultPageSize,
						searchText: overrides?.searchText ?? (searchText || undefined),
					})
					setCampaigns(res.data ?? [])
					setCurrentPage(res.currentPage)
					setTotalPages(res.totalPages)
					setHasPreviousPage(res.hasPreviousPage)
					setHasNextPage(res.hasNextPage)
					setTotalCount(res.totalCount)
					return res
				},
				{ setLoading }
			)
		},
		[searchText]
	)

	useEffect(() => {
		fetchCampaigns(1)
	}, [fetchCampaigns])

	const campaignTypeLabel = (type: CampaignType | string) => (type === CampaignType.Email || type === 'Email' ? t('Manage.Campaigns.Type_Email', 'Email') : String(type))

	return (
		<div className="space-y-5">
			<div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
				<div>
					<label className="form-label">{t('Manage.Campaigns.Filter_Search', 'Search campaigns')}</label>
					<input
						className="form-input"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder={t('Manage.Campaigns.SearchPlaceholder', 'Title, template, campaign ID...')}
					/>
				</div>
				<div className="flex gap-2">
					<button type="button" onClick={() => fetchCampaigns(1)} className="btn btn-primary">
						{t('Common.Search', 'Search')}
					</button>
					<button
						type="button"
						onClick={() => {
							setSearchText('')
							fetchCampaigns(1, { searchText: '' })
						}}
						className="btn btn-secondary"
					>
						{t('Common.Reset', 'Reset')}
					</button>
				</div>
			</div>

			<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<p className="text-xs uppercase text-gray-500">{t('Manage.Campaigns.Stat_Total', 'Total campaigns')}</p>
				<p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{totalCount}</p>
			</div>

			{loading ? (
				<AnimationSkeleton />
			) : campaigns.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-200 p-10 text-center dark:border-gray-700">
					<i className="ri-mail-send-line text-4xl text-gray-300" />
					<p className="mt-3 text-lg font-medium text-gray-700 dark:text-gray-200">{t('Manage.Campaigns.Empty_Title', 'No campaigns found')}</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{campaigns.map((campaign) => (
						<button
							key={campaign.id}
							type="button"
							className="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-primary/40 dark:border-gray-700 dark:bg-gray-800"
							onClick={() => navigate(MenuLinks.ViewCampaign.replace(':id', String(campaign.id)))}
						>
							<div className="flex items-start justify-between gap-3">
								<h3 className="truncate text-base font-semibold text-gray-800 dark:text-gray-100">{campaign.title}</h3>
								<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{campaignTypeLabel(campaign.campaignType)}</span>
							</div>
							<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
								<div>
									<p className="text-xs text-gray-400">{t('Manage.Campaigns.Template', 'Template')}</p>
									<p className="truncate font-medium text-gray-700 dark:text-gray-200">{campaign.templateName}</p>
								</div>
								<div>
									<p className="text-xs text-gray-400">{t('Manage.Campaigns.Recipients', 'Recipients')}</p>
									<p className="font-medium text-gray-700 dark:text-gray-200">{campaign.recipientCount}</p>
								</div>
								<div className="col-span-2">
									<p className="text-xs text-gray-400">{t('Manage.Campaigns.ScheduleDate', 'Schedule date')}</p>
									<p className="font-medium text-gray-700 dark:text-gray-200">{formatCampaignDate(campaign.scheduleDate)}</p>
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<Pagination currentPage={currentPage} totalPages={totalPages} hasPreviousPage={hasPreviousPage} hasNextPage={hasNextPage} onPageChange={(page) => fetchCampaigns(page)} />
			)}
		</div>
	)
}

export default ViewCampaigns
