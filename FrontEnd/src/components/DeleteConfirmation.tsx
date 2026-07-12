import React from 'react'
import { ModalLayout } from '@/components/HeadlessUI'
import { useTranslation } from 'react-i18next'

interface DeleteConfirmationProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title?: string
	description?: string
	confirmButtonText?: string
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ isOpen, onClose, onConfirm, title = 'Delete Confirmation', description = 'Are you sure you want to delete this item? This action cannot be undone.', confirmButtonText = 'Delete' }) => {
	const { t } = useTranslation()
	return (
		<ModalLayout showModal={isOpen} toggleModal={onClose} panelClassName="sm:max-w-xs" placement="justify-center items-start">
			<div className="duration-300 ease-in-out transition-all sm:w-full m-3 sm:mx-auto flex flex-col bg-red-500 shadow-sm rounded">
				<div className="p-9 overflow-y-auto">
					<div className="text-center text-white">
						<i className="ri-alert-fill text-4xl"></i> {/* Placeholder for an alert icon */}
						<h4 className="text-xl font-medium mt-3 mb-2.5">{title}</h4>
						<p className="mt-6 mb-4">{description}</p>
						<button type="button" className="btn bg-light text-gray-800 my-2 mr-2" onClick={onClose}>
							{t('Manage.Helper.Delete_Cancel')}
						</button>
						<button type="button" className="btn bg-red-600 text-white my-2" onClick={onConfirm}>
							{confirmButtonText}
						</button>
					</div>
				</div>
			</div>
		</ModalLayout>
	)
}

export default DeleteConfirmation
