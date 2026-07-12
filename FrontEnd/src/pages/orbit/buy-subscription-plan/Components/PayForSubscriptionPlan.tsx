import { Label } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { CreateIntentRequest, GetSubscriptionPlanDetailsResponse, StripeCurrencyType } from '@/helpers/api/WebApiClient'
import { subscriptionService } from '@/services/SubscriptionService'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface PayForSubscriptionPlanProps {
	selectedPlanForPayment: GetSubscriptionPlanDetailsResponse
	paymentActionClick: (action: string) => void
}

const PayForSubscriptionPlan: React.FC<PayForSubscriptionPlanProps> = (props) => {
	const { t } = useTranslation()
	const stripe = useStripe()
	const elements = useElements()
	const [isProcessing, setIsProcessing] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const navigate = useNavigate()
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!stripe || !elements) return

		setIsProcessing(true)
		setErrorMessage(null)

		const cardElement = elements.getElement(CardElement)

		if (!cardElement) return

		try {
			// STEP 1:  PaymentIntent create (Client Secret fetch )
			const createIntentResult = await subscriptionService.createIntent(
				new CreateIntentRequest({
					currency: StripeCurrencyType.USD,
					subscriptionId: props.selectedPlanForPayment.id,
				})
			)
			//STEP 2: Payment confirm
			const result = await stripe.confirmCardPayment(createIntentResult.clientSecret, {
				payment_method: {
					card: cardElement,
				},
			})

			if (result.error) {
				setErrorMessage(result.error.message || t('BuySubscription.Payment_PaymentFailed', 'Payment Failed'))
				setIsProcessing(false)
			} else {
				if (result.paymentIntent.status === 'succeeded') {
					navigate(MenuLinks.PaymentConfirmation, {
						state: {
							stripePaymentUniqueId: createIntentResult.transKey,
						},
					})
					props.paymentActionClick('close')
				}
			}
		} catch (err) {
			setErrorMessage(t('BuySubscription.Payment_UnexpectedError', 'An unexpected error occurred.'))
			setIsProcessing(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<div className="orbit-checkout-shell">
				{/* Header */}
				<div className="orbit-checkout-header">
					<h3 className="font-bold orbit-body-emphasis text-xl tracking-tight">{t('BuySubscription.Checkout_Heading', 'Checkout')}</h3>
					<button onClick={() => props.paymentActionClick('close')} className="orbit-checkout-close" type="button">
						<i className="ri-close-line text-2xl"></i>
					</button>
				</div>

				<div className="p-8">
					{/* Plan Summary */}
					<div className="orbit-checkout-summary">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-xs uppercase tracking-widest font-bold orbit-link mb-1">{t('BuySubscription.Checkout_SelectedPlan', 'Selected Plan')}</p>
								<h4 className="text-2xl font-black orbit-heading">{props.selectedPlanForPayment.name}</h4>
							</div>
							<div className="text-right">
								<p className="text-3xl font-black orbit-link-emphasis">${props.selectedPlanForPayment.price}</p>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<Label variant="section" className="ml-1">{t('BuySubscription.Checkout_CardDetails', 'Card Details')}</Label>

						<div className="orbit-checkout-card">
							<CardElement
								options={{
									style: {
										base: {
											fontSize: '16px',
											color: '#1f2937',
											'::placeholder': { color: '#9ca3af' },
										},
									},
								}}
							/>
						</div>

						{errorMessage && <p className="orbit-field-error text-sm mt-2">{errorMessage}</p>}

						<button type="submit" disabled={!stripe || isProcessing} className="orbit-checkout-pay-btn">
							{isProcessing ? (
								<>
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent mr-2" />
									{t('BuySubscription.Checkout_Processing', 'Processing...')}
								</>
							) : (
								<>
									<i className="ri-shield-check-line mr-2"></i>
									{t('BuySubscription.Checkout_PaySecurely', 'Pay Securely')} ${props.selectedPlanForPayment.price}
								</>
							)}
						</button>

						<div className="flex items-center justify-center gap-4 orbit-placeholder text-xs">
							<span>
								<i className="ri-lock-fill"></i> {t('BuySubscription.Checkout_SSLSecured', 'SSL Secured')}
							</span>
							<span>
								<i className="ri-stripe-fill"></i> {t('BuySubscription.Checkout_PoweredByStripe', 'Powered by Stripe')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}

export default PayForSubscriptionPlan
