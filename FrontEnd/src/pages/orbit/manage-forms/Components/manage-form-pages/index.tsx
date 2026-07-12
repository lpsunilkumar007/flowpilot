import { MODAL_PANEL_CLASS } from '@/constants'
import { ModalLayout } from '@/components/HeadlessUI'
import { PermissionTypes } from '@/constants/permissions'
import { formDesignerService } from '@/services/FormDesignerService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'

const EditFormPageDetails = React.lazy(() => import('./Components/EditFormPageDetails'))
const AddFormPageDetails = React.lazy(() => import('./Components/AddFormPageDetails'))
const ViewFormPages = React.lazy(() => import('./Components/ViewFormPage'))
const DeleteConfirmation = React.lazy(() => import('@/components/DeleteConfirmation'))
const ManageFormPageTabs = React.lazy(() => import('../manage-form-page-tabs'))
const SelectFieldType = React.lazy(() => import('@/pages/orbit/manage-fields/SelectFieldType'))

interface ManagePageProps {
	id: number
}

type ModalState = {
	isAddFormPageVisible: boolean
	formPageId: number
	reloadFormPage: boolean
	isDeleteModalOpen: boolean
	setIdToDelete: number
	isEditFormPageVisible: boolean
	isManageFormPageTabVisible: boolean
	isManageFieldVisible: boolean
}

const ManageFormPages: React.FC<ManagePageProps> = (props) => {
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		isAddFormPageVisible: false,
		formPageId: 0,
		reloadFormPage: false,
		isDeleteModalOpen: false,
		setIdToDelete: 0,
		isEditFormPageVisible: false,
		isManageFormPageTabVisible: false,
		isManageFieldVisible: false,
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
			case 'CloseAddModal':
				assignValueToModal('isAddFormPageVisible', false)
				break
			case 'CloseEditModal':
				assignValueToModal('isEditFormPageVisible', false)
				assignValueToModal('reloadFormPage', !modalState.reloadFormPage)
				break
			case 'NewFormPageAdded':
				assignValueToModal('reloadFormPage', !modalState.reloadFormPage)
				break
			case 'DeletePage':
				assignValueToModal('setIdToDelete', id)
				assignValueToModal('isDeleteModalOpen', true)
				break
			case 'EditPage':
				assignValueToModal('formPageId', id)
				assignValueToModal('isEditFormPageVisible', true)
				break

			case 'FormPageEdit':
				assignValueToModal('isEditFormPageVisible', false)
				assignValueToModal('reloadFormPage', !modalState.reloadFormPage)
				break

			case 'DeleteConfirmed':
				await runWithToast(() => formDesignerService.deleteFormPage(modalState.setIdToDelete), {
					onSuccess: (response) => {
						messageHelper.showSuccess(response)
						assignValueToModal('isDeleteModalOpen', false)
						assignValueToModal('setIdToDelete', 0)
						assignValueToModal('reloadFormPage', !modalState.reloadFormPage)
					},
				})
				break
			case 'ManageFormPageTabs':
				assignValueToModal('formPageId', id)
				assignValueToModal('isManageFormPageTabVisible', true)
				break
			case 'CloseManageFormPageTab':
				assignValueToModal('isManageFormPageTabVisible', false)
				assignValueToModal('reloadFormPage', !modalState.reloadFormPage)
				break
			case 'ManageFields':
				assignValueToModal('formPageId', id)
				assignValueToModal('isManageFieldVisible', true)
				break
			case 'CloseManageFields':
				assignValueToModal('isManageFieldVisible', false)
				break
			default:
				break
		}
	}

	return (
		<>
			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_ManageForm_Create) && (
					<PageTitle
						actions={
							<button onClick={() => toggleModal('isAddFormPageVisible')} className="btn btn-primary">
								{t('Manage.Form.FormPages.Add_Btn', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewFormPages formStructureId={props.id} reloadFormPage={modalState.reloadFormPage} onActionClick={handleActionClick} />
				</PageBody>
			</PageWrapper>
			<ModalLayout isStatic={true} showModal={modalState.isAddFormPageVisible} toggleModal={() => toggleModal('isAddFormPageVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddFormPageDetails formStructureId={props.id} onActionClick={handleActionClick} />
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isEditFormPageVisible} toggleModal={() => toggleModal('isEditFormPageVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<EditFormPageDetails id={modalState.formPageId} onActionClick={handleActionClick} />
			</ModalLayout>
			<ModalLayout isStatic={true} showModal={modalState.isManageFormPageTabVisible} toggleModal={() => toggleModal('isManageFormPageTabVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<ManageFormPageTabs formPageId={modalState.formPageId} onActionClick={handleActionClick} />
			</ModalLayout>
			<ModalLayout isStatic={true} showModal={modalState.isManageFieldVisible} toggleModal={() => toggleModal('isManageFieldVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<SelectFieldType formPageId={modalState.formPageId} onActionClick={handleActionClick} />
			</ModalLayout>
			{modalState.isDeleteModalOpen && <DeleteConfirmation isOpen={modalState.isDeleteModalOpen} onClose={() => toggleModal('isDeleteModalOpen')} onConfirm={() => handleActionClick(modalState.setIdToDelete, 'DeleteConfirmed')} title="Delete Item" description="Are you sure you want to delete this item? This action cannot be undone." confirmButtonText="Yes, Delete" />}
		</>
	)
}

export default ManageFormPages
