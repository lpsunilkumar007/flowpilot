import { PageBreadcrumbsWithLinks } from '@/components'
import React, { useEffect, useState } from 'react'
import ViewLookUpCodes from './Components/ViewLookUpCodes'
import { MenuLinks } from '@/constants/menu'
import { useNavigate } from 'react-router-dom'
import { LookUpCodeTypes } from '@/helpers/api/WebApiClient'
import { useTranslation } from 'react-i18next'
import { PageBody, PageWrapper } from '@/components/PageWrapper'

type ModalState = {
	redirectToManageLookUpValueScreen: boolean
	idForEdit: number
	lookUpCodeType?: LookUpCodeTypes
}

const ManageLookUps: React.FC = () => {
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		redirectToManageLookUpValueScreen: false,
		idForEdit: 0,
	})

	const navigate = useNavigate()

	const onActionClick = async (id: number, action: string, lookUpCodeType: LookUpCodeTypes) => {
		if (action === 'ViewValues') {
			setModalState((prev) => ({ ...prev, idForEdit: id, redirectToManageLookUpValueScreen: true, lookUpCodeType: lookUpCodeType }))
		}
	}
	useEffect(() => {
		if (modalState.redirectToManageLookUpValueScreen) {
			navigate(MenuLinks.ManageLookUpValues.replace(':id', String(modalState.lookUpCodeType)).replace(':lookupCodeId', String(modalState.idForEdit)))
		}
	}, [modalState])

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Lookups_Heading', 'Lookups')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Lookups_Breadcrumb', 'Lookups') }]} />
			<PageWrapper>
				<PageBody>
					<ViewLookUpCodes onActionClick={onActionClick} />
				</PageBody>
			</PageWrapper>
		</>
	)
}

export default ManageLookUps
