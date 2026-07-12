import { PageBreadcrumbsWithLinks } from '@/components'
import { MODAL_PANEL_CLASS } from '@/constants'
import { MenuLinks } from '@/constants/menu'
import { lazy, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { ModalLayout } from '@/components/HeadlessUI'
import { LookUpCodeTypes } from '@/helpers/api/WebApiClient'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'

const ViewLookUpCodeValues = withSuspense(lazy(() => import('./Components/ViewLookUpCodeValues')))
const AddLookUpCodeValue = withSuspense(lazy(() => import('./Components/AddLookUpCodeValue')))
const EditLookUpCodeValue = withSuspense(lazy(() => import('./Components/EditLookUpCodeValue')))

type ModalState = {
	lookUpCodeType?: LookUpCodeTypes
	lookupCodeId?: number
	isAddLookUpCodeValueVisible: boolean
	isEditLookUpCodeValueVisible: boolean
	idToEdit: number
}

type RouteParams = {
	id: string
	lookupCodeId: string
}

const ManageLookUpCodeValues: React.FC = () => {
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
			const lookUpCodeType = id as LookUpCodeTypes
			const _lookupCodeId = parseInt(lookupCodeId)
			setModalState((prev) => ({ ...prev, lookUpCodeType: lookUpCodeType, lookupCodeId: _lookupCodeId }))
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
			<PageBreadcrumbsWithLinks title={t('Manage.Values_Heading', 'Lookup Values')} subNames={[{ label: t('Manage.Values.Administrators_Subtitle', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Values_Subtitle', 'Lookups'), link: MenuLinks.ManageLookUps }, { label: t('Manage.Values_Breadcrumb', 'Values') }]} />
			{modalState.lookUpCodeType && modalState.lookupCodeId && (
				<>
					<PageWrapper>
						{userHasPermission(PermissionTypes.Permissions_ManageLookUps_Create) && (
							<PageTitle
								actions={
									<button onClick={() => toggleModal('isAddLookUpCodeValueVisible')} className="btn btn-primary">
										{t('Manage.Values.Grid_Add', 'Add')}
									</button>
								}
							/>
						)}
						<PageBody>
							<ViewLookUpCodeValues onActionClick={onActionClick} lookUpCodeType={modalState.lookUpCodeType} reloadLookUpCodeValues={reloadLookUpCodeValues} />
						</PageBody>
					</PageWrapper>

					<ModalLayout isStatic={true} showModal={modalState.isAddLookUpCodeValueVisible} toggleModal={() => toggleModal('isAddLookUpCodeValueVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
						<AddLookUpCodeValue lookUpCodeId={modalState.lookupCodeId} addNewLookUpCodeValueOutPut={handleAddNewLookUpCodeValueOutPut} />
					</ModalLayout>

					<ModalLayout isStatic={true} showModal={modalState.isEditLookUpCodeValueVisible} toggleModal={() => toggleModal('isEditLookUpCodeValueVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
						{modalState.idToEdit > 0 && <EditLookUpCodeValue editLookUpCodeValueOutPut={handleEditLookUpCodeValueOutPut} id={modalState.idToEdit} />}
					</ModalLayout>
				</>
			)}
		</>
	)
}

export default ManageLookUpCodeValues
