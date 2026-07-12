import DeleteConfirmation from '@/components/DeleteConfirmation'
import { emailTemplateService } from '@/services/EmailTemplateService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { PermissionTypes } from '@/constants/permissions'
import { ActionDropdown } from '@/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewEmailTemplatesActionButtonsProp {
	onActionClick: (id: number, actiontype: string) => void
	id: number
}

const ViewEmailTemplatesActionButtons: React.FC<ViewEmailTemplatesActionButtonsProp> = (props) => {
	const { t } = useTranslation()
	const [idToDelete, setIdToDelete] = useState<number>(0)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const onEmailTemplateDelete = async (id: number) => {
		setIdToDelete(id)
		toggleModal()
	}

	const handleDelete = async () => {
		await runWithToast(() => emailTemplateService.deleteEmailTemplate(props.id), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.onActionClick(props.id, 'Delete')
				toggleModal()
				setIdToDelete(0)
			},
		})
	}

	const toggleModal = () => {
		setIsModalOpen((prev) => !prev)
	}

	return (
		<>
			<ActionDropdown
				label={t('Manage.EmailTemplates.Actions_Actions', 'Actions')}
				items={[
					{
						key: 'edit',
						label: t('Manage.EmailTemplates.Actions_Edit', 'Edit'),
						onClick: () => props.onActionClick(props.id, 'Edit'),
					},
					{
						key: 'delete',
						label: t('Manage.EmailTemplates.Actions_Delete', 'Delete'),
						onClick: () => onEmailTemplateDelete(props.id),
						permission: PermissionTypes.Permissions_EmailTemplates_Delete,
					},
				]}
				menuHeight={120}
			/>

			{idToDelete > 0 && isModalOpen && (
				<DeleteConfirmation
					isOpen={isModalOpen}
					onClose={toggleModal}
					onConfirm={handleDelete}
					title={t('Manage.EmailTemplates.Delete_Title', 'Delete Email Template')}
					description={t('Manage.EmailTemplates.Delete_Description', 'Are you sure you want to delete this email template?')}
					confirmButtonText={t('Manage.EmailTemplates.Delete_Confirm', 'Delete')}
				/>
			)}
		</>
	)
}

export default ViewEmailTemplatesActionButtons
