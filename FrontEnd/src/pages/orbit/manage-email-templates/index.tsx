import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBreadcrumbsWithLinks } from '@/components'
import { ModalLayout } from '@/components/HeadlessUI'
import { usePermission } from '@/hooks/usePermission'
import { lazy, useState, useTransition } from 'react'
import withSuspense from '@/helpers/suspense.helper'
import { PermissionTypes } from '@/constants/permissions'
import { useTranslation } from 'react-i18next'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'

const ViewEmailTemplates = withSuspense(lazy(() => import('./Components/ViewEmailTemplates')))
const AddEmailTemplates = withSuspense(lazy(() => import('./Components/AddEmailTemplates')))
const EditEmailTemplates = withSuspense(lazy(() => import('./Components/EditEmailTemplates')))

type ModalState = {
	isAddEmailTemplateVisible: boolean
	isEditEmailTemplateVisible: boolean
	emailTemplateToEdit: number
	reloadEmailTemplate: boolean
}

const ManageEmailTemplates = () => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [modalState, setModalState] = useState<ModalState>({
		isAddEmailTemplateVisible: false,
		isEditEmailTemplateVisible: false,
		emailTemplateToEdit: 0,
		reloadEmailTemplate: false,
	})

	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}

	const onActionClick = async (id: number, action: string) => {
		if (action === 'Edit') {
			setModalState((prev) => ({ ...prev, emailTemplateToEdit: id, isEditEmailTemplateVisible: true }))
		} else if (action === 'Delete') {
			toggleModal('reloadEmailTemplate')
		}
	}

	const handleAddEmailTemplateOutput = (isAdded: boolean) => {
		if (isAdded) toggleModal('reloadEmailTemplate')
		toggleModal('isAddEmailTemplateVisible')
	}

	const handleEditEmailTemplateOutput = (isUpdated: boolean) => {
		if (isUpdated) toggleModal('reloadEmailTemplate')
		setModalState((prev) => ({ ...prev, emailTemplateToEdit: 0, isEditEmailTemplateVisible: false }))
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.EmailTemplates_Heading', 'Email Templates')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.EmailTemplates_Breadcrumb', 'Email Templates') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_EmailTemplates_Create) && (
					<PageTitle
						actions={
							<button onClick={() => toggleModal('isAddEmailTemplateVisible')} className="btn btn-primary">
								{t('Manage.EmailTemplates.Grid_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewEmailTemplates onActionClick={onActionClick} reloadUsers={false} reloadEmailTemplate={modalState.reloadEmailTemplate} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={modalState.isAddEmailTemplateVisible} toggleModal={() => toggleModal('isAddEmailTemplateVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddEmailTemplates addNewUserOutPut={handleAddEmailTemplateOutput} />
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isEditEmailTemplateVisible} toggleModal={() => toggleModal('isEditEmailTemplateVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.emailTemplateToEdit && <EditEmailTemplates editEmailTemplatePut={handleEditEmailTemplateOutput} id={modalState.emailTemplateToEdit} />}
			</ModalLayout>
		</>
	)
}
export default ManageEmailTemplates
