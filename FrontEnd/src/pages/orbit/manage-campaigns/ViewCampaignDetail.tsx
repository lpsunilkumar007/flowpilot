import { FormInput, PageBreadcrumbsWithLinks, VerticalForm } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import { SearchEmailTemplateRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { campaignService } from '@/services/CampaignService'
import { emailTemplateService } from '@/services/EmailTemplateService'
import { CampaignType, type UpdateCampaignRequest, type ViewCampaignDetailResponse } from '@/types/crm/campaign.types'
import { yupResolver } from '@hookform/resolvers/yup'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import CampaignDetailHeader from './Components/CampaignDetailHeader'
import CampaignSectionCard from './Components/CampaignSectionCard'

type CampaignDetailsFormValues = {
	title: string
	campaignType: string
	templateId: string
	scheduleDate: string
	message?: string
}

const toDateTimeLocal = (value?: string | moment.Moment) => (value ? moment(value).format('YYYY-MM-DDTHH:mm') : '')

const ViewCampaignDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const canView = userHasPermission(PermissionTypes.Permissions_ManageCampaigns_View)
	const [loading, setLoading] = useState(true)
	const [formKey, setFormKey] = useState(0)
	const [campaign, setCampaign] = useState<ViewCampaignDetailResponse | null>(null)
	const [templates, setTemplates] = useState<{ id: number; name: string }[]>([])

	const reload = async () => {
		if (!id) return
		const campaignRes = await campaignService.getById(Number(id))
		setCampaign(campaignRes)
		setFormKey((key) => key + 1)
	}

	useEffect(() => {
		if (!id || !canView) return
		const load = async () => {
			setLoading(true)
			try {
				const searchModel = new SearchEmailTemplateRequest()
				searchModel.pageNumber = 1
				searchModel.pageSize = PagingVariables.DefaultPageSize
				const [campaignRes, templatePage] = await Promise.all([campaignService.getById(Number(id)), emailTemplateService.getEmailTemplates(searchModel)])
				setCampaign(campaignRes)
				setTemplates(
					(templatePage.data ?? [])
						.filter((item): item is typeof item & { id: number; name: string } => Boolean(item.id && item.name))
						.map((item) => ({ id: item.id, name: item.name }))
				)
			} catch {
				setCampaign(null)
			} finally {
				setLoading(false)
			}
		}
		void load()
	}, [id, canView])

	const schemaResolver = yupResolver(
		yup.object().shape({
			title: yup.string().trim().required('This field cannot be left empty'),
			campaignType: yup.string().required('Please select a value'),
			templateId: yup.string().required('Please select a value'),
			scheduleDate: yup.string().required('This field cannot be left empty'),
		})
	)

	const showBackendSuccess = (response?: string) => {
		messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Campaigns.Updated', 'Campaign updated successfully'))
	}

	const onSubmit = async (formData: CampaignDetailsFormValues) => {
		if (!id) return
		const campaignId = Number(id)
		const payload: UpdateCampaignRequest = {
			id: campaignId,
			title: formData.title.trim(),
			campaignType: CampaignType.Email,
			templateId: Number(formData.templateId),
			scheduleDate: moment(formData.scheduleDate).toISOString(),
			message: formData.message?.trim() || undefined,
		}

		await runWithToast(() => campaignService.update(campaignId, payload), {
			onSuccess: (response) => {
				showBackendSuccess(response)
				void reload()
			},
		})
	}

	if (loading || !campaign) {
		return (
			<div className="space-y-6">
				<PageBreadcrumbsWithLinks title={t('Manage.Campaigns.Detail_Heading', 'Campaign Details')} subNames={[{ label: t('Manage.Campaigns_Heading', 'Campaigns'), link: MenuLinks.ManageCampaigns }, { label: t('Manage.Campaigns.Detail.Breadcrumb', 'Details') }]} />
				{loading ? <AnimationSkeleton /> : <p className="text-sm text-gray-500">{t('Manage.Campaigns.NotFound', 'Campaign not found.')}</p>}
			</div>
		)
	}

	const templateOptions =
		campaign.templateId && !templates.some((template) => template.id === campaign.templateId)
			? [{ id: campaign.templateId, name: campaign.templateName }, ...templates]
			: templates

	const defaultValues: CampaignDetailsFormValues = {
		title: campaign.title,
		campaignType: CampaignType.Email,
		templateId: String(campaign.templateId ?? ''),
		scheduleDate: toDateTimeLocal(campaign.scheduleDate),
		message: campaign.message ?? '',
	}

	return (
		<div className="space-y-6">
			<PageBreadcrumbsWithLinks
				title={t('Manage.Campaigns.Detail_Heading', 'Campaign Details')}
				subNames={[{ label: t('Manage.Campaigns_Heading', 'Campaigns'), link: MenuLinks.ManageCampaigns }, { label: t('Manage.Campaigns.Detail.Breadcrumb', 'Details') }]}
			/>

			<CampaignDetailHeader campaign={campaign} />

			<div className="space-y-6">
				<CampaignSectionCard
					title={t('Manage.Campaigns.EditDetails', 'Campaign details')}
					subtitle={t('Manage.Campaigns.EditDetails_Sub', 'Keep information accurate for your team')}
					icon="ri-edit-box-line"
				>
					<VerticalForm<CampaignDetailsFormValues> key={formKey} onSubmit={onSubmit} resolver={schemaResolver as any} defaultValues={defaultValues}>
						<div>
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								<FormInput label={t('Manage.Campaigns.Title', 'Title')} required name="title" type="text" className="form-input" />
								<FormInput label={t('Manage.Campaigns.Type', 'Type')} required name="campaignType" type="bottom-sheet" className="form-select">
									<option value={CampaignType.Email}>{t('Manage.Campaigns.Type_Email', 'Email')}</option>
								</FormInput>
								<FormInput label={t('Manage.Campaigns.Template', 'Email template')} required name="templateId" type="bottom-sheet" className="form-select">
									<option value="">{t('Common.Select', 'Select')}</option>
									{templateOptions.map((template) => (
										<option key={template.id} value={template.id}>
											{template.name}
										</option>
									))}
								</FormInput>
								<FormInput label={t('Manage.Campaigns.ScheduleDate', 'Schedule date')} required name="scheduleDate" type="datetime-local" className="form-input" />
								<div className="md:col-span-2">
									<FormInput label={t('Manage.Campaigns.Message', 'Message')} name="message" type="textarea" rows={4} className="form-input" />
								</div>
							</div>
							<div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
								<button type="submit" className="btn btn-primary">
									{t('Common.SaveChanges', 'Save changes')}
								</button>
							</div>
						</div>
					</VerticalForm>
				</CampaignSectionCard>

				<CampaignSectionCard
					title={t('Manage.Campaigns.Section_Recipients', 'Recipients')}
					subtitle={t('Manage.Campaigns.Section_Recipients_Sub', 'Assigned users who will receive this campaign')}
					icon="ri-group-line"
				>
					<div className="overflow-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
								<tr>
									<th className="px-2 py-3">{t('Manage.Campaigns.UserId', 'Lead ID')}</th>
									<th className="px-2 py-3">{t('Manage.Campaigns.Contact', 'Assigned user email')}</th>
								</tr>
							</thead>
							<tbody>
								{(campaign.campaignUsers ?? []).map((user) => (
									<tr key={user.id} className="border-t border-gray-100 dark:border-gray-700">
										<td className="px-2 py-3 font-medium text-gray-800 dark:text-gray-100">{user.userId}</td>
										<td className="px-2 py-3 text-gray-600 dark:text-gray-300">{user.contact}</td>
									</tr>
								))}
								{(campaign.campaignUsers ?? []).length === 0 && (
									<tr>
										<td colSpan={2} className="px-2 py-6 text-center text-gray-500">
											{t('Manage.Campaigns.NoRecipients', 'No recipients')}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CampaignSectionCard>
			</div>
		</div>
	)
}

export default ViewCampaignDetail
