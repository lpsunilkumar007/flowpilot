import { MenuLinks } from '@/constants/menu'
import { GetSubscriptionPlanDetailsResponse, TenantCurrentSubscriptionDetailResponse, ValidityDurationType } from '@/helpers/api/WebApiClient'
import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'

interface PlanProps {
	plans: GetSubscriptionPlanDetailsResponse[]
	tenantPlan?: TenantCurrentSubscriptionDetailResponse
	onActionClick: (plan: GetSubscriptionPlanDetailsResponse, action: string) => void
}

const MonthlyPlans: React.FC<PlanProps> = (props) => {
	//const filterActivePlan = props.plans.find((x) => x.id === props.tenantPlan.fkSubscriptionPlanPKId)
	const isExpired = props.tenantPlan && moment(props.tenantPlan.expiredOn).isBefore(moment())
	const handlePurchase = async (plan: GetSubscriptionPlanDetailsResponse) => {
		props.onActionClick(plan, 'MonthlyPlanSelected')
	}
	return (
		<div className="orbit-plan-grid">
			{props.plans.map((plan) => {
				const isCurrentPlan = props.tenantPlan && props.tenantPlan.fkSubscriptionPlanPKId === plan.id

				const isExpiredPlan = isCurrentPlan && isExpired
				return (
					<div
						key={plan.id}
						className={
							isCurrentPlan
								? isExpiredPlan
									? 'orbit-plan-card orbit-plan-card--expired group'
									: 'orbit-plan-card orbit-plan-card--current group'
								: plan.ribbonText
									? 'orbit-plan-card orbit-plan-card--ribbon group'
									: 'orbit-plan-card orbit-plan-card--default group'
						}
					>
						{isExpiredPlan && (
							<div className="orbit-plan-badge orbit-plan-badge--expired">
								<i className="ri-time-line mr-1" />
								Expired Plan
							</div>
						)}

						{isCurrentPlan && !isExpiredPlan && (
							<div className="orbit-plan-badge orbit-plan-badge--current">
								<i className="ri-check-double-line mr-1" />
								Current Plan
							</div>
						)}

						{!isCurrentPlan && plan.ribbonText && (
							<div className="orbit-plan-badge orbit-plan-badge--ribbon">
								<i className="ri-flashlight-fill mr-1" /> {plan.ribbonText}
							</div>
						)}

						<div className="mb-6">
							<div className="flex justify-between items-start">
								<h3 className="text-2xl font-bold orbit-body-emphasis tracking-tight">{plan.name}</h3>
							</div>

							<div className="mt-6 flex items-baseline">
								<span className="orbit-plan-price">${plan.price}</span>
								<span className="orbit-plan-price-suffix">/mo</span>
							</div>
							<div className="mt-2 text-sm orbit-muted leading-relaxed">
								Valid for <span className="font-semibold">{plan.validityDuration}</span> month
							</div>

							<p className="mt-4 orbit-muted leading-relaxed ">{plan.description}</p>
						</div>

						<ul className="space-y-4 mb-8">
							{['Premium Support', 'Full Analytics', 'Priority Access'].map((feature, i) => (
								<li key={i} className="orbit-plan-feature-item">
									<i className="ri-checkbox-circle-fill orbit-status-icon--success text-lg"></i>
									{feature}
								</li>
							))}
						</ul>

						{props.tenantPlan && (
							<button
								disabled={!isExpired}
								onClick={() => handlePurchase(plan)}
								className={!isExpired ? 'orbit-plan-cta orbit-plan-cta--disabled' : -100 === plan.id ? 'orbit-plan-cta orbit-plan-cta--outline' : 'orbit-plan-cta orbit-plan-cta--primary'}
								type="button"
							>
								<span className="relative z-10 flex items-center justify-center gap-2">{!isExpired ? 'Current Plan Active' : 'Upgrade Now'}</span>
							</button>
						)}
						{!props.tenantPlan && (
							<div className="mt-auto">
								<Link to={`${MenuLinks.Login}?next=${MenuLinks.BuySubscriptionPlan}`} className="orbit-plan-login-link group/btn">
									<span className="relative z-10 flex items-center justify-center gap-2">
										<i className="ri-user-login-line text-lg"></i>
										Sign in to Choose Plan
									</span>
									<div className="orbit-plan-login-link-shine group-hover/btn:translate-x-0"></div>
								</Link>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}

export default MonthlyPlans
