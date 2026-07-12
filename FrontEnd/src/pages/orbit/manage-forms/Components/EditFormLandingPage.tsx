import { EmptyState, PageBreadcrumbsWithLinks, TabsWrapper } from '@/components'
import { MenuLinks } from '@/constants/menu'
import { title } from 'process'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

const ManageFormPages = React.lazy(() => import('./manage-form-pages'))
const EditFormDetail = React.lazy(() => import('./EditFormDetails'))

type RouteParams = { id: string }

type ModalState = {
	tabIndex: number
}
const EditFormLandingPage: React.FC = () => {
	const { t } = useTranslation()
	const { id } = useParams<RouteParams>()

	const tabContent = [
		{
			title: t('Manage.Forms.Edit.Edit_Form_Tab_Title', 'Edit Form Tab Title'),
			content: <EditFormDetail id={Number(id)} />,
		},
		{
			title: t('Manage.Forms.Edit.FormPage.Form_Page_Tab_Title', 'Form Page Tab Title'),
			content: <ManageFormPages id={Number(id)} />,
		},
	]
	const [modalState, setModalState] = useState<ModalState>({
		tabIndex: 0,
	})
	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}
	return (
		<>
			{id && (
				<>
					<PageBreadcrumbsWithLinks title={t('Manage.Forms.Edit_Heading', 'Edit Heading')} subNames={[{ label: t('Manage.Forms_Heading', 'Forms'), link: MenuLinks.ManageForms }, { label: t('Manage.Forms.Edit.BreadCrumb', 'Breadcrumb') }]} />
					<TabsWrapper
						tabs={tabContent.map((tab, idx) => ({ ...tab, key: idx }))}
						variant="pill"
						selectedIndex={modalState.tabIndex}
						onChange={(index) => assignValueToModal('tabIndex', index)}
						className="mb-6"
					/>
				</>
			)}
		</>
	)
}

export default EditFormLandingPage
