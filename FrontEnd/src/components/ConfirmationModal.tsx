import React from 'react'
import { ModalLayout } from './HeadlessUI'
import { useTranslation } from 'react-i18next'

interface ConfirmationModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title?: string
	description?: string
	confirmButtonText?: string
	variant?: 'primary' | 'destructive' | 'warning'
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title = 'Confirmation', description = 'Are you sure you want to proceed?', confirmButtonText = 'Confirm', variant = 'primary' }) => {
	const isDestructive = variant === 'destructive'
	const isWarning = variant === 'warning'
	const { t } = useTranslation()
	const getBgColor = () => {
		if (isDestructive) return 'bg-red-500'
		if (isWarning) return 'bg-amber-500'
		return 'bg-primary'
	}

	const getConfirmBtnColor = () => {
		if (isDestructive) return 'bg-red-600 text-white'
		if (isWarning) return 'bg-amber-600 text-white'
		return 'bg-primary text-white'
	}

	const getIcon = () => {
		if (isDestructive) return <i className="ri-alert-fill text-4xl" />
		if (isWarning) return <i className="ri-error-warning-fill text-4xl" />
		return <i className="ri-information-fill text-4xl" />
	}

	return (
		<ModalLayout showModal={isOpen} toggleModal={onClose} panelClassName="sm:max-w-xs" placement="justify-center items-start">
			<div className={`sm:w-full m-3 sm:mx-auto flex flex-col ${getBgColor()} shadow-sm rounded`}>
				<div className="p-9 overflow-y-auto">
					<div className="text-center text-white">
						{getIcon()}

						<h4 className="text-xl font-medium mt-3 mb-2.5">{t(title)}</h4>

						<p className="mt-6 mb-4">{t(description)}</p>

						<button type="button" className="btn bg-light text-gray-800 my-2 mr-2 hover:bg-gray-200 transition-all duration-200" onClick={onClose}>
							{t('Manage.Helper.Delete_Cancel')}
						</button>

						<button
							type="button"
							className={`btn bg-light text-gray-800 my-2 mr-2 hover:bg-gray-200 transition-all duration-200`}
							onClick={() => {
								onConfirm()
								onClose()
							}}
						>
							{t(confirmButtonText)}
						</button>
					</div>
				</div>
			</div>
		</ModalLayout>
	)
}

export default ConfirmationModal
