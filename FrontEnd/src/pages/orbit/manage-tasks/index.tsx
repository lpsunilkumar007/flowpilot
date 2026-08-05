import { PageBreadcrumbsWithLinks } from '@/components'
import { ModalLayout } from '@/components/HeadlessUI'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MODAL_PANEL_CLASS } from '@/constants'
import { PermissionTypes } from '@/constants/permissions'
import withSuspense from '@/helpers/suspense.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

const ViewTasks = withSuspense(lazy(() => import('./Components/ViewTasks')))
const AddTaskModal = withSuspense(lazy(() => import('./Components/AddTaskModal')))

type ModalState = {
	isAddTaskVisible: boolean
	reloadTasks: boolean
}

const ManageTasks: React.FC = () => {
	const { userHasPermission } = usePermission()
	const [searchParams] = useSearchParams()
	const { t } = useTranslation()
	const isIndirectTeam = searchParams.get('teamMode') === 'indirect'
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageTasks_Create) && !isIndirectTeam
	const [modalState, setModalState] = useState<ModalState>({
		isAddTaskVisible: false,
		reloadTasks: false,
	})

	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}

	const handleAddTaskOutput = (isAdded: boolean) => {
		if (isAdded) toggleModal('reloadTasks')
		toggleModal('isAddTaskVisible')
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Tasks_Heading', 'Tasks')} subNames={[{ label: t('Manage.Tasks.Breadcrumb', 'Tasks') }]} />

			<PageWrapper>
				{canCreate && (
					<PageTitle
						actions={
							<button onClick={() => toggleModal('isAddTaskVisible')} className="btn btn-primary inline-flex items-center gap-2 shadow-sm">
								<i className="ri-add-line" />
								{t('Manage.Tasks.Action_Add', 'Create Task')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewTasks reloadTasks={modalState.reloadTasks} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={modalState.isAddTaskVisible} toggleModal={() => toggleModal('isAddTaskVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddTaskModal addTaskOutput={handleAddTaskOutput} />
			</ModalLayout>
		</>
	)
}

export default ManageTasks
