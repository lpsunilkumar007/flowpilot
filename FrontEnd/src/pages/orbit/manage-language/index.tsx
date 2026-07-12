import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBreadcrumbsWithLinks } from '@/components'
import React, { lazy, useState } from 'react'
import { ModalLayout } from '@/components/HeadlessUI'
import { useTranslation } from 'react-i18next'
import withSuspense from '@/helpers/suspense.helper'

import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'

const ViewCountry = withSuspense(lazy(() => import('./Components/ViewCountry')))
const AddCountry = withSuspense(lazy(() => import('./Components/AddCountry')))
const EditCountry = withSuspense(lazy(() => import('./Components/EditCountry')))

const ManageLanguage: React.FC = () => {
	const [showAddModal, setShowAddModal] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [editCountryId, setEditCountryId] = useState<number | null>(null)
	const [reload, setReload] = useState(false)
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const toggleAddModal = () => setShowAddModal((prev) => !prev)

	const onActionClick = (id: number, action: string) => {
		if (action === 'Edit') {
			setEditCountryId(id)
			setShowEditModal(true)
		}
		//  else if (action === 'View') {

		// }
		else if (action === 'Delete') {
			setReload((prev) => !prev)
		}
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Languages_Heading', 'Languages')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Languages_Breadcrumb', 'Languages') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_CountryLocalization_Create) && (
					<PageTitle
						actions={
							<button onClick={toggleAddModal} className="btn btn-primary">
								{t('Manage.Languages.Grid_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewCountry reload={reload} onActionClick={onActionClick} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={showAddModal} toggleModal={() => setShowAddModal(false)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddCountry
					onClose={() => setShowAddModal(false)}
					onAdded={() => {
						setShowAddModal(false)
						setReload((prev) => !prev)
					}}
				/>
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={showEditModal} toggleModal={() => setShowEditModal(false)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{editCountryId !== null && (
					<EditCountry
						id={editCountryId}
						onClose={() => {
							setShowEditModal(false)
							setEditCountryId(null)
						}}
						onUpdated={() => {
							setShowEditModal(false)
							setEditCountryId(null)
							setReload((prev) => !prev)
						}}
					/>
				)}
			</ModalLayout>
		</>
	)
}

export default ManageLanguage
