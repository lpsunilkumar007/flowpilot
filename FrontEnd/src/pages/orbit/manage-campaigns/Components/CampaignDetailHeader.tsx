import { formatHelper } from '@/helpers/format.helper'
import { CampaignType, type ViewCampaignDetailResponse } from '@/types/crm/campaign.types'
import moment from 'moment'

const cardClass = 'rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'

interface CampaignDetailHeaderProps {
	campaign: ViewCampaignDetailResponse
}

const formatDateTime = (value?: string) => (value ? formatHelper.DateTimeFormat(moment(value).toDate()) : '—')

const CampaignDetailHeader: React.FC<CampaignDetailHeaderProps> = ({ campaign }) => {
	const typeLabel = campaign.campaignType === CampaignType.Email || campaign.campaignType === 'Email' ? 'Email' : String(campaign.campaignType)

	return (
		<div className={`${cardClass} overflow-hidden`}>
			<div className="bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-6 dark:from-primary/10">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500">Campaign #{campaign.id}</p>
						<h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{campaign.title}</h1>
						<p className="mt-2 text-gray-600 dark:text-gray-300">{campaign.templateName}</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{typeLabel}</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
						<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
							<p className="text-xs text-gray-500">Schedule</p>
							<p className="mt-1 text-sm font-semibold">{formatDateTime(campaign.scheduleDate)}</p>
						</div>
						<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
							<p className="text-xs text-gray-500">Recipients</p>
							<p className="mt-1 text-sm font-semibold">{campaign.campaignUsers?.length ?? 0}</p>
						</div>
						<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
							<p className="text-xs text-gray-500">Created</p>
							<p className="mt-1 text-sm font-semibold">{formatHelper.MomentDateFormat(campaign.createdOn)}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CampaignDetailHeader
