import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PopupHeader, PopupWrapper } from '@/components'
import { formDesignerService } from '@/services/FormDesignerService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'

const AddFormPageTab = React.lazy(() => import('./Components/AddFormPageTab'))
const EditFormPageTab = React.lazy(() => import('./Components/EditFormPageTab'))
const DeleteConfirmation = React.lazy(() => import('@/components/DeleteConfirmation'))
const ViewFromPageTabDetails = React.lazy(() => import('./Components/ViewFromPageTabDetails'))

interface ManageFormPageTabsProps {
	formPageId: number
	onActionClick: (id: number, action: string) => void
}

type ModalState = {
	tabId: number
	reloadFormPageTabs: boolean
	isDeleteModalOpen: boolean
	setIdToDelete: number
	isEditFormPageTabVisible: boolean
}

const ManageFormPageTabs: React.FC<ManageFormPageTabsProps> = (props) => {
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		tabId: 0,
		reloadFormPageTabs: false,
		isDeleteModalOpen: false,
		setIdToDelete: 0,
		isEditFormPageTabVisible: false,
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
	const handleActionClick = async (id: number, action: string) => {
		switch (action) {
			case 'DeleteFormPageTab':
				assignValueToModal('setIdToDelete', id)
				assignValueToModal('isDeleteModalOpen', true)
				break
			case 'EditFormPageTab':
				assignValueToModal('tabId', id)
				assignValueToModal('isEditFormPageTabVisible', true)
				break
			case 'EditCompleted':
			case 'CancelEditAction':
				assignValueToModal('isEditFormPageTabVisible', false)
				assignValueToModal('reloadFormPageTabs', !modalState.reloadFormPageTabs)
				break

			case 'NewTabAdded':
				assignValueToModal('reloadFormPageTabs', !modalState.reloadFormPageTabs)
				break
			case 'DeleteConfirmed':
				await runWithToast(() => formDesignerService.deleteFormPagTab(id), {
					onSuccess: (response) => {
						messageHelper.showSuccess(response)
						assignValueToModal('isDeleteModalOpen', false)
						assignValueToModal('setIdToDelete', 0)
						assignValueToModal('reloadFormPageTabs', !modalState.reloadFormPageTabs)
						assignValueToModal('isEditFormPageTabVisible', false)
					},
				})
				break
		}
	}
	return (
		<>
			<PopupWrapper variant="form-tabs">
				<PopupHeader title={t('Manage.FormPage.Tabs.Heading', 'Form Page Tabs')} onClose={() => props.onActionClick(0, 'CloseManageFormPageTab')} />

				{modalState.isEditFormPageTabVisible ? <EditFormPageTab formPageTabId={modalState.tabId} onActionClick={handleActionClick} formPagePkId={props.formPageId} /> : <AddFormPageTab formPagePkId={props.formPageId} onActionClick={handleActionClick} reloadFormPageTabs={modalState.reloadFormPageTabs} />}

				<div className="p-6">
					<ViewFromPageTabDetails formPageId={props.formPageId} onActionClick={handleActionClick} reloadFormPageTabs={modalState.reloadFormPageTabs} />
				</div>
			</PopupWrapper>

			{modalState.isDeleteModalOpen && <DeleteConfirmation isOpen={modalState.isDeleteModalOpen} onClose={() => toggleModal('isDeleteModalOpen')} onConfirm={() => handleActionClick(modalState.setIdToDelete, 'DeleteConfirmed')} title="Delete Item" description="Are you sure you want to delete this item? This action cannot be undone." confirmButtonText="Yes, Delete" />}
		</>
	)
}

export default ManageFormPageTabs
