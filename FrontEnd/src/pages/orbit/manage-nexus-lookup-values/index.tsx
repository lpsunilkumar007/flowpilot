import { PageBreadcrumbsWithLinks } from '@/components'
import { MODAL_PANEL_CLASS } from '@/constants'
import { MenuLinks } from '@/constants/menu'
import { lazy, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { ModalLayout } from '@/components/HeadlessUI'
import { NexusLookUpCodeTypes } from '@/helpers/api/WebApiClient'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'

const ViewNexusLookUpCodeValues = withSuspense(lazy(() => import('./Components/ViewNexusLookUpCodeValues')))
const AddNexusLookUpCodeValue = withSuspense(lazy(() => import('./Components/AddNexusLookUpCodeValue')))
const EditNexusLookUpCodeValue = withSuspense(lazy(() => import('./Components/EditLookUpCodeValue')))

type ModalState = {
	nexusLookUpCodeType?: NexusLookUpCodeTypes
	lookupCodeId?: number
	isAddLookUpCodeValueVisible: boolean
	isEditLookUpCodeValueVisible: boolean
	idToEdit: number
}

type RouteParams = {
	id: string
	lookupCodeId: string
}

const ManageNexusLookUpCodeValues: React.FC = () => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [reloadLookUpCodeValues, setReloadLookUpCodeValues] = useState(false)
	const [modalState, setModalState] = useState<ModalState>({
		isAddLookUpCodeValueVisible: false,
		isEditLookUpCodeValueVisible: false,
		idToEdit: 0,
	})

	const { id, lookupCodeId } = useParams<RouteParams>()

	useEffect(() => {
		if (id && lookupCodeId) {
			const lookUpCodeType = id as NexusLookUpCodeTypes
			const _lookupCodeId = parseInt(lookupCodeId)
			setModalState((prev) => ({ ...prev, nexusLookUpCodeType: lookUpCodeType, lookupCodeId: _lookupCodeId }))
		}
	}, [id, lookupCodeId])

	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}

	const handleAddNewLookUpCodeValueOutPut = (refreshGrid: boolean, closePopup: boolean) => {
		if (refreshGrid) setReloadLookUpCodeValues((prev) => !prev)
		if (closePopup) setModalState((prev) => ({ ...prev, idToEdit: 0, isAddLookUpCodeValueVisible: false }))
	}

	const handleEditLookUpCodeValueOutPut = (isAdded: boolean) => {
		if (isAdded) setReloadLookUpCodeValues((prev) => !prev)
		setModalState((prev) => ({ ...prev, idToEdit: 0, isEditLookUpCodeValueVisible: false }))
	}

	const onActionClick = async (id: number, action: string) => {
		if (action === 'Edit') {
			setModalState((prev) => ({ ...prev, idToEdit: id, isEditLookUpCodeValueVisible: true }))
		}
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Nexus.Values.ManageValues_Heading', 'Manage Values')} subNames={[{ label: t('Manage.Nexus.Values.Administrators_Subtitle', 'Administrators') }, { label: t('Manage.Nexus.Values.ManageNexusLookups_Subtitle', 'Nexus Lookups'), link: MenuLinks.ManageNexusLookUps }, { label: t('Manage.Nexus.Values.ManageValues_Breadcrumb', 'Values') }]} />
			{modalState.nexusLookUpCodeType && modalState.lookupCodeId && (
				<>
					<PageWrapper>
						{userHasPermission(PermissionTypes.Permissions_ManageLookUps_Create) && (
							<PageTitle
								actions={
									<button onClick={() => toggleModal('isAddLookUpCodeValueVisible')} className="btn btn-primary">
										{t('Manage.Nexus.Values.Grid_Add', 'Add')}
									</button>
								}
							/>
						)}
						<PageBody>
							<ViewNexusLookUpCodeValues onActionClick={onActionClick} nexusLookUpCodeType={modalState.nexusLookUpCodeType} reloadLookUpCodeValues={reloadLookUpCodeValues} />
						</PageBody>
					</PageWrapper>

					<ModalLayout isStatic={true} showModal={modalState.isAddLookUpCodeValueVisible} toggleModal={() => toggleModal('isAddLookUpCodeValueVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
						<AddNexusLookUpCodeValue lookUpCodeId={modalState.lookupCodeId} addNewLookUpCodeValueOutPut={handleAddNewLookUpCodeValueOutPut} />
					</ModalLayout>

					<ModalLayout isStatic={true} showModal={modalState.isEditLookUpCodeValueVisible} toggleModal={() => toggleModal('isEditLookUpCodeValueVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
						{modalState.idToEdit > 0 && <EditNexusLookUpCodeValue editLookUpCodeValueOutPut={handleEditLookUpCodeValueOutPut} id={modalState.idToEdit} />}
					</ModalLayout>
				</>
			)}
		</>
	)
}

export default ManageNexusLookUpCodeValues
