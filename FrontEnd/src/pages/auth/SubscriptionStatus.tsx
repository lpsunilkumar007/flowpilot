import { TenantCurrentSubscriptionDetailResponse } from '@/helpers/api/WebApiClient'
import { subscriptionService } from '@/services/SubscriptionService'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { AnimationSkeleton } from '../ui/Skeleton'
import { APICore } from '@/helpers/api/apiCore'
import { useNavigate } from 'react-router-dom'
import { MenuLinks } from '@/constants/menu'
type ModalState = {
	loading: boolean
	subscriptionPlanDetail: TenantCurrentSubscriptionDetailResponse
	isExpired: boolean
}

const SubscriptionWarning = () => {
	const [modalState, setModalState] = useState<ModalState>({
		loading: false,
		subscriptionPlanDetail: new TenantCurrentSubscriptionDetailResponse(),
		isExpired: false,
	})

	const apiCore = new APICore()
	const navigate = useNavigate()
	const assignValueToModal = (key: keyof ModalState, value: any) => {
		setModalState((prev) => ({ ...prev, [key]: value }))
	}

	const fetchData = async () => {
		assignValueToModal('loading', true)
		try {
			const response = await subscriptionService.getCurrentSubscriptionDetail()
			const isExpired = response.expiredOn && moment(response.expiredOn).isBefore(moment())
			if (!isExpired && !response.isOverDue && !response.latePaymentOverDue) {
				navigate(MenuLinks.Login)
				return
			}
			assignValueToModal('subscriptionPlanDetail', response)
			assignValueToModal('isExpired', isExpired)
		} finally {
			assignValueToModal('loading', false)
		}
	}

	useEffect(() => {
		const isUserLogin = apiCore.isUserAuthenticated()

		if (!isUserLogin) {
			navigate(MenuLinks.Login)
			return
		}

		fetchData()
	}, [navigate])

	const status = modalState.isExpired ? 'expired' : modalState.subscriptionPlanDetail.isOverDue || modalState.subscriptionPlanDetail.latePaymentOverDue ? 'overdue' : null
	const statusConfig = status
		? {
				expired: {
					icon: 'ri-timer-2-fill',
					bg: 'bg-gradient-to-r from-amber-400/10 to-orange-400/10 border-amber-200/50 backdrop-blur-sm',
					text: 'text-amber-700 dark:text-amber-300',
				},
				overdue: {
					icon: 'ri-close-circle-fill',
					bg: 'bg-gradient-to-r from-red-400/10 to-rose-400/10 border-red-200/50 backdrop-blur-sm',
					text: 'text-red-700 dark:text-red-300',
				},
		  }[status]
		: null

	if (modalState.loading) {
		return (
			<div className="subscription-status-bg">
				<div className="max-w-4xl mx-auto px-4 py-20">
					<AnimationSkeleton />
				</div>
			</div>
		)
	}

	return (
		<div className="subscription-status-bg">
			<div className="max-w-4xl mx-auto px-4 py-12">
				<div className="mb-8 text-center">
					<h1 className="text-4xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Subscription Status</h1>
					<p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Manage your current plan and billing status with full transparency</p>
				</div>

				<div className="group bg-white/70 dark:bg-white/[8%] backdrop-blur-xl rounded-3xl p-6 border border-white/50 dark:border-white/10 shadow-2xl overflow-hidden space-y-6">
					{status && statusConfig && (
						<div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${statusConfig.bg} border`}>
							<div className="absolute top-3 right-3 w-20 h-20 bg-white/10 rounded-full blur-xl -z-10 animate-pulse" />

							<div className="flex items-start gap-4 flex-1">
								<i className={`${statusConfig.icon} text-3xl ${statusConfig.text}`} />
								<div>
									<h2 className="text-2xl font-bold capitalize mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{status} Subscription</h2>
									{status === 'overdue' && (
										<>
											<p className="text-base max-w-md">Your payment is overdue. Immediate action required.</p>
										</>
									)}
									{status === 'expired' && <p className="text-base max-w-md">Your subscription has expired. Renew to regain access.</p>}
								</div>
							</div>
						</div>
					)}

					<div className="space-y-4">
						<div className="flex items-center">
							<div>
								<h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Plan Details</h3>
							</div>
						</div>

						<div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-sm ">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 py-6">
								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<i className="ri-stack-line text-lg" />
									</div>
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">Plan Name</p>
										<p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{modalState.subscriptionPlanDetail.name}</p>
									</div>
								</div>

								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
										<i className="ri-money-dollar-circle-line text-lg" />
									</div>
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">Monthly Price</p>
										<p className="mt-1 text-base font-semibold text-emerald-600">${Number(modalState.subscriptionPlanDetail.price).toFixed(2)}</p>
									</div>
								</div>

								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
										<i className="ri-calendar-line text-lg" />
									</div>
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">Expires On</p>
										<p className="mt-1 text-base font-semibold text-amber-600">{moment(modalState.subscriptionPlanDetail.expiredOn).format('MMM DD, YYYY')}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div>
						<h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Invoices</h3>

						<div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70">
							<table className="min-w-full text-sm">
								<thead className="bg-slate-100 dark:bg-slate-800">
									<tr>
										<th className="px-6 py-3 text-left font-semibold">Period</th>
										<th className="px-6 py-3 text-left font-semibold">Status</th>
										<th className="px-6 py-3 text-right font-semibold">Action</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-slate-200 dark:divide-slate-700">
									{modalState.subscriptionPlanDetail.invoices &&
										modalState.subscriptionPlanDetail.invoices.map((invoice) => (
											<tr key={invoice.invoiceId}>
												<td className="px-6 py-4">
													{moment(invoice.periodFrom).format('MMM DD, YYYY')} – {moment(invoice.periodTo).format('MMM DD, YYYY')}
												</td>

												<td className="px-6 py-4">
													<span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.invoiceStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : invoice.invoiceStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{invoice.invoiceStatus}</span>
												</td>

												<td className="px-6 py-4 text-right">
													{invoice.invoiceStatus !== 'Paid' && invoice.stripeInvoiceUrl && (
														<a href={invoice.stripeInvoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition">
															Pay
														</a>
													)}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SubscriptionWarning
