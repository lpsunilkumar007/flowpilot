import { APICore } from '@/helpers/api/apiCore'
import { lazy, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MenuLinks } from '@/constants/menu'
import { GetPaymentStatusResponse, StripePaymentStatus } from '@/helpers/api/WebApiClient'
import { subscriptionService } from '@/services/SubscriptionService'
import { messageHelper } from '@/helpers/message.helper'
import withSuspense from '@/helpers/suspense.helper'

const PaymentSuccess = withSuspense(lazy(() => import('./Components/PaymentSuccess')))
const PaymentFailed = withSuspense(lazy(() => import('./Components/PaymentFailed')))

const PaymentConfirmation = () => {
	const api = new APICore()
	const navigate = useNavigate()
	const location = useLocation()
	const stripePaymentUniqueId = location.state?.stripePaymentUniqueId
	let pollingInterval: any = null

	const [stripePaymentStatus, setStripePaymentStatus] = useState<GetPaymentStatusResponse>(
		new GetPaymentStatusResponse({
			paymentStatus: StripePaymentStatus.Pending,
		})
	)

	const fetchData = async () => {
		try {
			const response = await subscriptionService.getPaymentStatus(stripePaymentUniqueId)
			setStripePaymentStatus(response)
			if (response.paymentStatus != StripePaymentStatus.Pending) {
				clearInterval(pollingInterval)
				pollingInterval = null
			}
		} catch (error: any) {
			messageHelper.showError(error)
			clearInterval(pollingInterval)
			pollingInterval = null
		}
	}

	useEffect(() => {
		const isUserLogin = api.isUserAuthenticated()
		if (!isUserLogin || !stripePaymentUniqueId) {
			navigate(MenuLinks.Login)
		}

		pollingInterval = setInterval(fetchData, 3000)
	}, [])

	if (!stripePaymentUniqueId) return null
	return (
		<>
			{stripePaymentStatus && (
				<div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
					{stripePaymentStatus.paymentStatus === StripePaymentStatus.Pending ? (
						<>
							<div className="flex h-[900px] w-full items-center justify-center rounded-xl border card">
								<div className="text-center">
									<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600" />
									<p className="text-sm orbit-label-secondary">Payment Status Loading....</p>
								</div>
							</div>
						</>
					) : (
						<>{stripePaymentStatus.paymentStatus === StripePaymentStatus.Paid ? <PaymentSuccess transactionKeyId={stripePaymentUniqueId} amount={stripePaymentStatus.amount!} currency={stripePaymentStatus.currency!} /> : <PaymentFailed transactionKeyId={stripePaymentUniqueId} amount={stripePaymentStatus.amount!} currency={stripePaymentStatus.currency!} />}</>
					)}
				</div>
			)}
		</>
	)
}

export default PaymentConfirmation
