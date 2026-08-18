import { FormInput, PageBreadcrumbsWithLinks, VerticalForm } from '@/components'
import { PageBody, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import { SearchEmailTemplateRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { campaignService } from '@/services/CampaignService'
import { emailTemplateService } from '@/services/EmailTemplateService'
import { offeringService } from '@/services/OfferingService'
import { CampaignType, type CreateCampaignRequest } from '@/types/crm/campaign.types'
import type { OfferingDropDownItemResponse } from '@/types/crm/offering.types'
import { yupResolver } from '@hookform/resolvers/yup'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import CampaignLeadPicker from './Components/CampaignLeadPicker'

type CreateCampaignFormValues = {
	title: string
	campaignType: string
	offeringId: string
	templateId: string
	scheduleDate: string
	message?: string
	leadIds: number[]
}

const CreateCampaign: React.FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { userHasPermission } = usePermission()
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageCampaigns_Create)
	const [offerings, setOfferings] = useState<OfferingDropDownItemResponse[]>([])
	const [templates, setTemplates] = useState<{ id: number; name: string }[]>([])

	useEffect(() => {
		const searchModel = new SearchEmailTemplateRequest()
		searchModel.pageNumber = 1
		searchModel.pageSize = PagingVariables.DefaultPageSize
		Promise.all([offeringService.getActiveDropDown(), emailTemplateService.getEmailTemplates(searchModel)])
			.then(([offeringList, templatePage]) => {
				setOfferings(offeringList ?? [])
				setTemplates(
					(templatePage.data ?? [])
						.filter((item): item is typeof item & { id: number; name: string } => Boolean(item.id && item.name))
						.map((item) => ({ id: item.id, name: item.name }))
				)
			})
			.catch(() => {
				setOfferings([])
				setTemplates([])
			})
	}, [])

	const schemaResolver = yupResolver(
		yup.object().shape({
			title: yup.string().trim().required('This field cannot be left empty'),
			campaignType: yup.string().required('Please select a value'),
			offeringId: yup.string().required('Please select a value'),
			templateId: yup.string().required('Please select a value'),
			scheduleDate: yup.string().required('This field cannot be left empty'),
			leadIds: yup.array().of(yup.number().required()).min(1, 'Please select at least one lead').required('Please select at least one lead'),
		})
	)

	const onSubmit = async (formData: CreateCampaignFormValues) => {
		const payload: CreateCampaignRequest = {
			title: formData.title.trim(),
			campaignType: formData.campaignType as CampaignType,
			offeringId: Number(formData.offeringId),
			templateId: Number(formData.templateId),
			scheduleDate: moment(formData.scheduleDate).toISOString(),
			message: formData.message?.trim() || undefined,
			leadIds: formData.leadIds,
		}

		await runWithToast(() => campaignService.create(payload), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				navigate(MenuLinks.ViewCampaign.replace(':id', String(response.id)))
			},
		})
	}

	return (
		<>
			<PageBreadcrumbsWithLinks
				title={t('Manage.Campaigns.Add_Heading', 'Create Campaign')}
				subNames={[
					{ label: t('Manage.Campaigns_Heading', 'Campaigns'), link: MenuLinks.ManageCampaigns },
					{ label: t('Manage.Campaigns.Add.Breadcrumb', 'Create') },
				]}
			/>

			<PageWrapper>
				<PageBody>
			<VerticalForm<CreateCampaignFormValues>
				onSubmit={onSubmit}
				resolver={schemaResolver as any}
				defaultValues={{
					title: '',
					campaignType: CampaignType.Email,
					offeringId: '',
					templateId: '',
					scheduleDate: moment().add(1, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm'),
					message: '',
					leadIds: [],
				}}
			>
				<div className="space-y-6 pb-24">
					<section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
						<div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Manage.Campaigns.Section_Details', 'Campaign details')}</h3>
						</div>
						<div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
							<FormInput label={t('Manage.Campaigns.Title', 'Title')} name="title" type="text" required className="form-input" />
							<FormInput label={t('Manage.Campaigns.Type', 'Type')} name="campaignType" type="bottom-sheet" required className="form-select">
								<option value={CampaignType.Email}>{t('Manage.Campaigns.Type_Email', 'Email')}</option>
							</FormInput>
							<FormInput label={t('Manage.Campaigns.Offering', 'Offering')} name="offeringId" type="bottom-sheet" required className="form-select">
								<option value="">{t('Common.Select', 'Select')}</option>
								{offerings.map((offering) => (
									<option key={offering.value} value={offering.value}>
										{offering.text}
									</option>
								))}
							</FormInput>
							<FormInput label={t('Manage.Campaigns.Template', 'Email template')} name="templateId" type="bottom-sheet" required className="form-select">
								<option value="">{t('Common.Select', 'Select')}</option>
								{templates.map((template) => (
									<option key={template.id} value={template.id}>
										{template.name}
									</option>
								))}
							</FormInput>
							<FormInput label={t('Manage.Campaigns.ScheduleDate', 'Schedule date')} name="scheduleDate" type="datetime-local" required className="form-input" />
							<div className="md:col-span-2">
								<FormInput label={t('Manage.Campaigns.Message', 'Message')} name="message" type="textarea" rows={4} className="form-input" />
							</div>
						</div>
					</section>

					<section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
						<div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Manage.Campaigns.Section_Leads', 'Select leads')}</h3>
							<p className="mt-0.5 text-sm text-gray-500">{t('Manage.Campaigns.Section_Leads_Sub', 'Choose leads associated with the selected offering. Leads without an email cannot be selected.')}</p>
						</div>
						<div className="p-5">
							<CampaignLeadPicker />
						</div>
					</section>

					<div className="flex justify-end gap-2">
						<button type="button" className="btn btn-secondary" onClick={() => navigate(MenuLinks.ManageCampaigns)}>
							{t('Common.Cancel', 'Cancel')}
						</button>
						{canCreate && <button className="btn btn-primary">{t('Manage.Campaigns.Add_Save', 'Create campaign')}</button>}
					</div>
				</div>
			</VerticalForm>
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default CreateCampaign
