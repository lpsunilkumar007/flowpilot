import PageBreadcrumbsWithLinks from '@/components/PageBreadcrumbsWithLinks'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { formDesignerService } from '@/services/FormDesignerService'
import React from 'react'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'

const ViewFormDetails = React.lazy(() => import('./Components/ViewFormDetails'))
const DeleteConfirmation = React.lazy(() => import('@/components/DeleteConfirmation'))

type ModalState = {
	formId: number
	reloadForms: boolean
	isDeleteModalOpen: boolean
	setIdToDelete: number
}

const ManageForms: React.FC = () => {
	const { userHasPermission } = usePermission()
	const navigate = useNavigate()
	const { t } = useTranslation()

	const [modalState, setModalState] = useState<ModalState>({
		formId: 0,
		reloadForms: false,
		isDeleteModalOpen: false,
		setIdToDelete: 0,
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
			case 'Delete':
				assignValueToModal('setIdToDelete', id)
				assignValueToModal('isDeleteModalOpen', true)
				break
			case 'DeleteConfirmed':
				await runWithToast(() => formDesignerService.deleteFormStructure(id), {
					onSuccess: (response) => {
						messageHelper.showSuccess(response)
						assignValueToModal('isDeleteModalOpen', false)
						assignValueToModal('setIdToDelete', 0)
						assignValueToModal('reloadForms', !modalState.reloadForms)
					},
				})
				break
			default:
				break
		}
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Forms_Heading', 'Forms')} subNames={[{ label: t('Manage.Forms.Breadcrumb', 'Forms') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_ManageForm_Create) && (
					<PageTitle
						actions={
							<button onClick={() => navigate(MenuLinks.AddManageForm)} className="btn btn-primary">
								{t('Manage.Forms.Action_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewFormDetails onActionClick={handleActionClick} reloadForms={modalState.reloadForms} />
				</PageBody>
			</PageWrapper>

			{modalState.isDeleteModalOpen && <DeleteConfirmation isOpen={modalState.isDeleteModalOpen} onClose={() => toggleModal('isDeleteModalOpen')} onConfirm={() => handleActionClick(modalState.setIdToDelete, 'DeleteConfirmed')} title="Delete Item" description="Are you sure you want to delete this item? This action cannot be undone." confirmButtonText="Yes, Delete" />}
		</>
	)
}

export default ManageForms
