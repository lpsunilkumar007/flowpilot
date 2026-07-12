import { MODAL_PANEL_CLASS } from '@/constants'
import { GetSubscriptionPlanDetailsResponse, TenantCurrentSubscriptionDetailResponse, ValidityDurationType } from '@/helpers/api/WebApiClient'
import { subscriptionService } from '@/services/SubscriptionService'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { lazy, useEffect, useMemo, useState } from 'react'
import { APICore } from '@/helpers/api/apiCore'
import { ModalLayout } from '@/components/HeadlessUI'
import withSuspense from '@/helpers/suspense.helper'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useTranslation } from 'react-i18next'

const MonthlyPlans = withSuspense(lazy(() => import('./Components/MonthlySubscriptionPlan')))
const YearlyPlans = withSuspense(lazy(() => import('./Components/YearlySubscriptionPlan')))
const PayForSubscriptionPlan = withSuspense(lazy(() => import('./Components/PayForSubscriptionPlan')))

type ModalState = {
	loading: boolean
	selectedTypeValidityDurationType: ValidityDurationType
	plans: GetSubscriptionPlanDetailsResponse[]
	tenantPlan?: TenantCurrentSubscriptionDetailResponse
	selectedPlanForPayment: GetSubscriptionPlanDetailsResponse
	isPaymentModalOpen: boolean
}

const BuySubscriptionPlan = () => {
	const { t } = useTranslation()
	const api = new APICore()
	const [stripeInfo, setStripeInfo] = useState<{ stripe: any }>({
		stripe: null,
	})

	const [modalState, setModalState] = useState<ModalState>({
		loading: false,
		selectedTypeValidityDurationType: ValidityDurationType.Months,
		plans: [],
		selectedPlanForPayment: new GetSubscriptionPlanDetailsResponse(),
		isPaymentModalOpen: false,
	})

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}

	const fetchSubscriptionPlans = async () => {
		try {
			assignValueToModal('loading', true)
			const response = await subscriptionService.getAllSubscriptionDetails()
			assignValueToModal('plans', response)
			if (api.isUserAuthenticated()) {
				const response = await subscriptionService.getCurrentSubscriptionDetail()
				assignValueToModal('tenantPlan', response)
			}
		} finally {
			assignValueToModal('loading', false)
		}
	}

	const filteredPlans = useMemo(() => {
		return modalState.plans.filter((plan) => plan.validityDurationType === modalState.selectedTypeValidityDurationType).sort((a, b) => a.displayOrder - b.displayOrder)
	}, [modalState.plans, modalState.selectedTypeValidityDurationType])

	const handleActionClick = (plan: GetSubscriptionPlanDetailsResponse, _: string) => {
		// if (action === 'YearlyPlanSelected') {
		assignValueToModal('selectedPlanForPayment', plan)
		assignValueToModal('isPaymentModalOpen', true)
		// }
		// if (action === 'MonthlyPlanSelected') {
		// 	assignValueToModal('selectedPlanForPayment', plan)
		// 	assignValueToModal('isPaymentModalOpen', true)
		// }
	}
	const handlePaymentAction = (action: string) => {
		if (action === 'close') {
			assignValueToModal('isPaymentModalOpen', false)
		}
	}
	useEffect(() => {
		const fetchData = async () => {
			await fetchSubscriptionPlans()
			await fetch('/stripeConfig.json')
				.then((response) => response.json())
				.then((config) => {
					const stripeInstance = loadStripe(config.stripePublishableKey)
					setStripeInfo({ stripe: stripeInstance })
				})
				.catch((error) => console.error('Error loading config:', error))
		}
		fetchData()
	}, [])

	return (
		<>
			{modalState.loading && <AnimationSkeleton />}

			{!modalState.loading && (
				<div className="orbit-plan-page">
					<div className="orbit-plan-page-container">
						<div className="orbit-plan-page-header">
							<h2 className="orbit-plan-page-title">{t('BuySubscription.Heading_ChoosePlan', 'Choose a plan that works for you')}</h2>
							<p className="orbit-plan-page-subtitle">{t('BuySubscription.Subtitle_Pricing', 'Simple, transparent pricing for your business needs.')}</p>
							<div className="mt-10 flex justify-center">
								<div className="orbit-plan-toggle">
									<button
										onClick={() => assignValueToModal('selectedTypeValidityDurationType', ValidityDurationType.Months)}
										className={modalState.selectedTypeValidityDurationType === ValidityDurationType.Months ? 'orbit-plan-toggle-btn orbit-plan-toggle-btn--active' : 'orbit-plan-toggle-btn orbit-plan-toggle-btn--inactive'}
										type="button"
									>
										{t('BuySubscription.Toggle_Monthly', 'Monthly')}
									</button>

									<button
										onClick={() => assignValueToModal('selectedTypeValidityDurationType', ValidityDurationType.Years)}
										className={modalState.selectedTypeValidityDurationType === ValidityDurationType.Years ? 'orbit-plan-toggle-btn orbit-plan-toggle-btn--active' : 'orbit-plan-toggle-btn orbit-plan-toggle-btn--inactive'}
										type="button"
									>
										{t('BuySubscription.Toggle_Annually', 'Annually')}
									</button>
								</div>
							</div>
						</div>

						<div className="max-w-5xl mx-auto">
							{modalState.selectedTypeValidityDurationType === ValidityDurationType.Months && <MonthlyPlans plans={filteredPlans} tenantPlan={modalState.tenantPlan} onActionClick={handleActionClick} />}
							{modalState.selectedTypeValidityDurationType === ValidityDurationType.Years && <YearlyPlans plans={filteredPlans} tenantPlan={modalState.tenantPlan} onActionClick={handleActionClick} />} *
						</div>
					</div>
				</div>
			)}

			<ModalLayout isStatic={true} showModal={modalState.isPaymentModalOpen} toggleModal={() => toggleModal('isPaymentModalOpen')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<Elements stripe={stripeInfo.stripe}>
					<PayForSubscriptionPlan selectedPlanForPayment={modalState.selectedPlanForPayment} paymentActionClick={handlePaymentAction} />
				</Elements>
			</ModalLayout>
		</>
	)
}

export default BuySubscriptionPlan
