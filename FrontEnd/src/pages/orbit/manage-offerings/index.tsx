import { PageBreadcrumbsWithLinks } from '@/components'
import { ModalLayout } from '@/components/HeadlessUI'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MODAL_PANEL_CLASS } from '@/constants'
import { PermissionTypes } from '@/constants/permissions'
import { UserDropDownItemResponse, type ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import withSuspense from '@/helpers/suspense.helper'
import { usePermission } from '@/hooks/usePermission'
import { RootState } from '@/redux/store'
import { DropDownService } from '@/services/DropDownService'
import type { ViewOfferingResponse } from '@/types/crm/offering.types'
import React, { lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const ViewOfferings = withSuspense(lazy(() => import('./Components/ViewOfferings')))
const AddOfferingModal = withSuspense(lazy(() => import('./Components/AddOfferingModal')))

const ManageOfferings: React.FC = () => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageOfferings_Create)
	const userData = useSelector((state: RootState) => state.Auth.userData) as ViewUserDetailsResponse | undefined
	const currentUserId = userData?.id
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
	const [ownerUsers, setOwnerUsers] = useState<UserDropDownItemResponse[]>([])
	const [showModal, setShowModal] = useState(false)
	const [editingOffering, setEditingOffering] = useState<ViewOfferingResponse | null>(null)
	const [reloadOfferings, setReloadOfferings] = useState(false)

	useEffect(() => {
		DropDownService.getSystemUsers(false)
			.then((list) => setUsers(list ?? []))
			.catch(() => setUsers([]))
		DropDownService.getDirectReportSystemUsers()
			.then((list) => setOwnerUsers(list ?? []))
			.catch(() => setOwnerUsers([]))
	}, [])

	const ownerOptions = useMemo(() => {
		if (!currentUserId) return ownerUsers
		const selfId = String(currentUserId)
		const alreadyListed = ownerUsers.some((u) => u.strValue?.localeCompare(selfId, undefined, { sensitivity: 'accent' }) === 0)
		if (alreadyListed) return ownerUsers
		const name = `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim() || userData?.email || selfId
		return [new UserDropDownItemResponse({ strValue: selfId, text: name }), ...ownerUsers]
	}, [ownerUsers, currentUserId, userData?.firstName, userData?.lastName, userData?.email])

	const openCreate = () => {
		setEditingOffering(null)
		setShowModal(true)
	}

	const openEdit = (offering: ViewOfferingResponse) => {
		setEditingOffering(offering)
		setShowModal(true)
	}

	const closeModal = (saved: boolean) => {
		setShowModal(false)
		setEditingOffering(null)
		if (saved) setReloadOfferings((value) => !value)
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Offerings_Heading', 'Offerings')} subNames={[{ label: t('Manage.Offerings.Breadcrumb', 'Offerings') }]} />

			<PageWrapper>
				<PageTitle
					actions={
						canCreate && (
							<button type="button" className="btn btn-primary inline-flex items-center gap-2 shadow-sm" onClick={openCreate}>
								<i className="ri-add-line" />
								{t('Manage.Offerings.Action_Add', 'Create Offering')}
							</button>
						)
					}
				/>
				<PageBody>
					<ViewOfferings reloadOfferings={reloadOfferings} users={users} onEdit={openEdit} />
				</PageBody>
			</PageWrapper>

			{showModal && (
				<ModalLayout isStatic={true} showModal={showModal} toggleModal={() => closeModal(false)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
					<AddOfferingModal offering={editingOffering} users={ownerOptions} onClose={closeModal} />
				</ModalLayout>
			)}
		</>
	)
}

export default ManageOfferings
