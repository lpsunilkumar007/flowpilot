import { EmptyState } from '@/components'
import { GetTenantSubscriptionResponse } from '@/helpers/api/WebApiClient'
import { multiTenantService } from '@/services/MultiTenantService'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { fileUploadHelper } from '@/helpers/file.upload.helper'
import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewTenantSubscriptionProps {
	id: string | null
}

const ViewTenantSubscriptions: React.FC<ViewTenantSubscriptionProps> = (props) => {
	const { t } = useTranslation()
	const [tenantSubscriptionPlans, setTenantSubscriptionPlans] = useState<GetTenantSubscriptionResponse[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [selectedPlanId, setSelectedPlanId] = useState<number>()

	const fetchData = async () => {
		setLoading(true)
		try {
			const response = await multiTenantService.getTenantSubscription(Number(props.id))
			setTenantSubscriptionPlans(response)
			if (response.length > 0) {
				const activePlan = response.find((p) => p.isActive)
				setSelectedPlanId(activePlan ? activePlan.tenantSubscriptionId : response[0].tenantSubscriptionId)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleDownload = async (id: number) => {
		await runWithToast(async () => {
			const response = await multiTenantService.downloadInvoice(id)
			fileUploadHelper.downloadFileFromResponse(response)
			return response
		})
	}

	useEffect(() => {
		fetchData()
	}, [props.id])

	const selectedPlan = tenantSubscriptionPlans.find((p) => p.tenantSubscriptionId === selectedPlanId)

	if (loading) return <AnimationSkeleton />

	return (
		<>
			{tenantSubscriptionPlans.length === 0 ? (
				<div className="orbit-tenant-empty">
					<EmptyState title={t('Manage.Tenants.Subscriptions_NoSubscriptionsFound', 'No subscriptions found')} description={t('Manage.Tenants.Subscriptions_NoSubscriptionsForTenant', 'No subscriptions found for this tenant.')} />
				</div>
			) : (
				<div className="orbit-tenant-layout">
					{/* ================= LEFT: PLAN HISTORY ================= */}
					<div className="orbit-tenant-sidebar">
						<div className="orbit-tenant-sidebar-header">
							<span className="orbit-tenant-sidebar-title">{t('Manage.Tenants.Subscriptions_PlanHistory', 'Plan History')}</span>
						</div>

						<div className="divide-y divide-gray-100">
							{tenantSubscriptionPlans.map((plan: any) => (
								<button key={plan.tenantSubscriptionId} onClick={() => setSelectedPlanId(plan.tenantSubscriptionId)} className={selectedPlanId === plan.tenantSubscriptionId ? 'orbit-tenant-plan-item orbit-tenant-plan-item--selected' : 'orbit-tenant-plan-item'} type="button">
									<div className="flex justify-between items-center gap-2">
										<h3 className={selectedPlanId === plan.tenantSubscriptionId ? 'orbit-tenant-plan-title orbit-tenant-plan-title--selected' : 'orbit-tenant-plan-title'}>{plan.tenantSubscriptionName}</h3>
										<span className={plan.isActive ? 'orbit-tenant-pill orbit-tenant-pill--active' : 'orbit-tenant-pill orbit-tenant-pill--expired'}>{plan.isActive ? t('Manage.Tenants.Subscriptions_Active', 'ACTIVE') : t('Manage.Tenants.Subscriptions_Expired', 'EXPIRED')}</span>
									</div>

									<div className="flex justify-between items-end">
										<p className="text-xs orbit-muted">{t('Manage.Tenants.Subscriptions_Expires', 'Expires')}: {formatHelper.MomentDateFormat(plan.expiredOn)}</p>
										<p className="text-sm font-bold orbit-body">${plan.price}</p>
									</div>
								</button>
							))}
						</div>
					</div>

					{/* ================= RIGHT: PLAN DETAILS ================= */}
					<div id="plan-details" className="orbit-tenant-detail-panel">
						{selectedPlan ? (
							<div className="space-y-6">
								{/* Header */}
								<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
									<div>
										<h2 className="text-2xl font-bold orbit-heading">{selectedPlan.tenantSubscriptionName}</h2>
										<p className="orbit-muted mt-1 max-w-lg">{selectedPlan.tenantSubscriptionDescription}</p>
									</div>

									<div className="orbit-panel p-3 border border-gray-100 min-w-[100px] text-center">
										<p className="text-[10px] font-bold orbit-placeholder uppercase mb-1">{t('Manage.Tenants.Subscriptions_TotalPrice', 'Total Price')}</p>
										<p className="text-2xl font-black orbit-heading">${selectedPlan.price}</p>
										<p className="text-[10px] orbit-muted uppercase">{t('Manage.Tenants.Subscriptions_Per', 'per')} {selectedPlan.validityDurationType}</p>
									</div>
								</div>

								{/* Meta Cards */}
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
									<div className="p-4 orbit-panel">
										<p className="text-[10px] uppercase font-bold orbit-placeholder">{t('Manage.Tenants.Subscriptions_Validity', 'Validity')}</p>
										<p className="text-sm font-semibold orbit-body-emphasis">
											{selectedPlan.validityDuration} {selectedPlan.validityDurationType}
										</p>
									</div>

									<div className="p-4 orbit-panel">
										<p className="text-[10px] uppercase font-bold orbit-placeholder">{t('Manage.Tenants.Subscriptions_ExpirationDate', 'Expiration Date')}</p>
										<p className="text-sm font-semibold orbit-body-emphasis">{moment(selectedPlan.expiredOn).format('LL')}</p>
									</div>

									<div className="p-4 orbit-panel">
										<p className="text-[10px] uppercase font-bold orbit-placeholder">{t('Manage.Tenants.Subscriptions_StripeSubId', 'Stripe Sub ID')}</p>
										<code className="text-[11px] orbit-link break-all">{selectedPlan.stripeSubscriptionId || 'N/A'}</code>
									</div>
								</div>

								{/* Invoices */}
								<div>
									<h3 className="text-lg font-bold orbit-heading mb-4 flex items-center gap-2">
										{t('Manage.Tenants.Subscriptions_BillingScheduleInvoices', 'Billing Schedule & Invoices')}
										<span className="text-xs font-normal orbit-placeholder">({selectedPlan.tenantSubscriptionInvoiceResponses?.length || 0})</span>
									</h3>

									{selectedPlan.tenantSubscriptionInvoiceResponses?.length > 0 ? (
										<div className="overflow-x-auto rounded-xl border border-gray-200">
											<table className="min-w-full text-sm divide-y divide-gray-200">
												<thead className="orbit-panel">
													<tr>
														<th className="px-3 py-2 text-left text-xs font-bold orbit-muted uppercase">{t('Manage.Tenants.Subscriptions_BillingPeriod', 'Billing Period')}</th>
														<th className="px-3 py-2 text-left text-xs font-bold orbit-muted uppercase">{t('Manage.Tenants.Subscriptions_Status', 'Status')}</th>
														<th className="px-3 py-2 text-right text-xs font-bold orbit-muted uppercase">{t('Manage.Tenants.Subscriptions_Invoice', 'Invoice')}</th>
													</tr>
												</thead>

												<tbody className="orbit-surface divide-y divide-gray-100">
													{selectedPlan.tenantSubscriptionInvoiceResponses.map((invoice: any) => (
														<tr key={invoice.tenantSubscriptionInvoiceId} className="hover:bg-gray-50/50 transition-colors">
															<td className="px-3 py-2">
																<p className="font-medium orbit-body-emphasis">
																	{moment(invoice.periodFrom).format('MMM D, YYYY')} – {moment(invoice.periodTo).format('MMM D, YYYY')}
																</p>
																<p className="text-[10px] orbit-placeholder font-mono">{invoice.stripeInvoiceId || 'ID Pending'}</p>
															</td>

															<td className="px-3 py-2">
																<span className={invoice.stripePaymentStatus === 'Paid' ? 'orbit-tenant-invoice-pill orbit-tenant-invoice-pill--paid' : 'orbit-tenant-invoice-pill orbit-tenant-invoice-pill--unpaid'}>{invoice.stripePaymentStatus}</span>
															</td>

															<td className="px-3 py-2 text-right">
																{invoice.stripePaymentStatus === 'Paid' ? (
																	<button onClick={() => handleDownload(invoice.tenantSubscriptionInvoiceId)} className="orbit-tenant-download-btn" type="button">
																		<i className="ri-download-2-fill text-sm"></i>
																		{t('Common.Download', 'Download')}
																	</button>
																) : (
																	<span className="text-xs orbit-placeholder">{t('Manage.Tenants.Subscriptions_AvailableAfterPayment', 'Available after payment')}</span>
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<div className="py-10 text-center orbit-panel border border-dashed border-gray-200">
											<p className="text-sm orbit-placeholder">{t('Manage.Tenants.Subscriptions_NoInvoicesYet', 'No invoices generated for this plan yet.')}</p>
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center min-h-[300px] orbit-placeholder">
								<i className="ri-hand-pointer-line text-4xl mb-2"></i>
								<p>{t('Manage.Tenants.Subscriptions_SelectToViewBilling', 'Select a subscription to view billing details')}</p>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
}

export default ViewTenantSubscriptions
