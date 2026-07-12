import { PageBreadcrumbsWithLinks } from '@/components'
import React, { lazy, useEffect, useState } from 'react'
import { MenuLinks } from '@/constants/menu'
import { useNavigate } from 'react-router-dom'
import { NexusLookUpCodeTypes } from '@/helpers/api/WebApiClient'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { PageBody, PageWrapper } from '@/components/PageWrapper'

const ViewNexusLookUpCodes = withSuspense(lazy(() => import('./Components/ViewNexusLookUpCodes')))

type ModalState = {
	redirectToManageLookUpValueScreen: boolean
	idForEdit: number
	nexusLookUpCodeType?: NexusLookUpCodeTypes
}

const ManageNexusLookUps: React.FC = () => {
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		redirectToManageLookUpValueScreen: false,
		idForEdit: 0,
	})

	const navigate = useNavigate()

	const onActionClick = async (id: number, action: string, lookUpCodeType: NexusLookUpCodeTypes) => {
		if (action === 'ViewValues') {
			setModalState((prev) => ({ ...prev, idForEdit: id, redirectToManageLookUpValueScreen: true, nexusLookUpCodeType: lookUpCodeType }))
		}
	}
	useEffect(() => {
		if (modalState.redirectToManageLookUpValueScreen) {
			navigate(MenuLinks.ManageNexusLookUpValues.replace(':id', String(modalState.nexusLookUpCodeType)).replace(':lookupCodeId', String(modalState.idForEdit)))
		}
	}, [modalState])

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Nexus.Lookups_Heading', 'Nexus Lookups')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Nexus.Lookups_Breadcrumb', 'Nexus Lookups') }]} />

			<PageWrapper>
				<PageBody>
					<ViewNexusLookUpCodes onActionClick={onActionClick} />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default ManageNexusLookUps
