import React, { lazy, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageBreadcrumbsWithLinks } from '@/components'
import { MODAL_PANEL_CLASS } from '@/constants'
import { MenuLinks } from '@/constants/menu'
import { ModalLayout } from '@/components/HeadlessUI'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'

const ViewLocalization = withSuspense(lazy(() => import('./ViewLocalization')))
const AddLocalization = withSuspense(lazy(() => import('./AddLocalization')))
const EditLocalization = withSuspense(lazy(() => import('./EditLocalization')))

const ViewLocalizationPage: React.FC = () => {
	const { countryId } = useParams()
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [showAddModal, setShowAddModal] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [editLocalizationId, setEditLocalizationId] = useState<number | null>(null)
	const [reload, setReload] = useState(false)

	const toggleAddModal = () => setShowAddModal((prev) => !prev)

	const onActionClick = (id: number, action: string) => {
		if (action === 'Edit') {
			setEditLocalizationId(id)
			setShowEditModal(true)
		}
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Localization_Heading', 'Localization')} subNames={[{ label: t('Manage.Languages_Heading', 'Languages'), link: MenuLinks.ManageLanguage }, { label: t('Manage.Localization_Breadcrumb', 'Localization') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_CountryLocalization_Create) && (
					<PageTitle
						actions={
							<button onClick={toggleAddModal} className="btn btn-primary">
								{t('Manage.Localization.Grid_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewLocalization countryId={countryId!} reload={reload} onActionClick={onActionClick} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic showModal={showAddModal} toggleModal={() => setShowAddModal(false)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddLocalization
					countryId={Number(countryId)}
					onClose={() => setShowAddModal(false)}
					onAdded={() => {
						setShowAddModal(false)
						setReload((prev) => !prev)
					}}
				/>
			</ModalLayout>

			<ModalLayout isStatic showModal={showEditModal} toggleModal={() => setShowEditModal(false)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{editLocalizationId !== null && (
					<EditLocalization
						id={editLocalizationId}
						onClose={() => {
							setShowEditModal(false)
							setEditLocalizationId(null)
						}}
						onUpdated={() => {
							setShowEditModal(false)
							setEditLocalizationId(null)
							setReload((prev) => !prev)
						}}
					/>
				)}
			</ModalLayout>
		</>
	)
}

export default ViewLocalizationPage
