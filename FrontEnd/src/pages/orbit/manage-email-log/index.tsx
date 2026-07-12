import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBreadcrumbsWithLinks } from '@/components'
import React, { lazy, useState } from 'react'
import { ModalLayout } from '@/components/HeadlessUI'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'

import { PageBody, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'

const ViewEmailLog = withSuspense(lazy(() => import('./Components/ViewEmailLog')))
const ViewEmailLogDetails = withSuspense(lazy(() => import('./Components/ViewEmailLogDetails')))

type ModalState = {
	isViewEmailLogVisible: boolean
	id?: number
}
const ManageEmailLog: React.FC = () => {
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		isViewEmailLogVisible: false,
		id: 0,
	})
	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}
	const onActionClick = async (id: number, action: string) => {
		if (action === 'ViewEmailLogDetails') {
			setModalState((prev) => ({ ...prev, id: id, isViewEmailLogVisible: true }))
		}
	}
	const handleViewEmailLogOutput = (clsoePopup: boolean) => {
		if (clsoePopup) setModalState((prev) => ({ ...prev, id: undefined, isViewEmailLogVisible: false }))
	}
	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.EmailLog_Heading', 'Email Log')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.EmailLog_Breadcrumb', 'Email Log') }]} />

			<PageWrapper>
				<PageBody>
					<ViewEmailLog onActionClick={onActionClick} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={modalState.isViewEmailLogVisible} toggleModal={() => toggleModal('isViewEmailLogVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.id && <ViewEmailLogDetails viewEmailLogOutput={handleViewEmailLogOutput} id={modalState.id} />}
			</ModalLayout>
		</>
	)
}

export default ManageEmailLog
