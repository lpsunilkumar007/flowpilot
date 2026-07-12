import { MenuLinks } from '@/constants/menu'
import moment from 'moment'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface PaymentSuccessProps {
	transactionKeyId: string
	amount: number
	currency: string
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = (props) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	return (
		<>
			<div className="w-full max-w-md card rounded-xl border border-gray-100 p-10">
				<div className="flex justify-center mb-6">
					<div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center">
						<svg className="w-7 h-7 orbit-status-icon--success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				</div>
				<div className="text-center mb-8">
					<h2 className="text-[22px] font-semibold orbit-heading">{t('BuySubscription.PaymentSuccess_Heading', 'Payment successful')}</h2> <p className="orbit-muted mt-2 text-sm leading-relaxed">{t('BuySubscription.PaymentSuccess_Description', 'Thank you for your payment. Your transaction has been completed successfully.')}</p>
				</div>
				<div className="space-y-4 border-t border-b border-gray-100 py-6 mb-8">
					<div className="flex justify-between text-sm">
						<span className="orbit-muted">{t('BuySubscription.Payment_Amount', 'Amount')}</span>{' '}
						<span className="font-semibold orbit-heading">
							{props.amount} {props.currency.toUpperCase()}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="orbit-muted">{t('BuySubscription.Payment_TransactionId', 'Transaction ID')}</span> <span className="font-mono orbit-body text-xs">{props.transactionKeyId}</span>
					</div>
				</div>
				<div className="flex flex-col gap-3">
					<button onClick={() => navigate(MenuLinks.Login)} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-md transition-colors text-sm">
						{t('BuySubscription.Payment_GoToLogin', 'Go to login')}
					</button>
				</div>
			</div>
		</>
	)
}

export default PaymentSuccess
