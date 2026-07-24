import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBreadcrumbsWithLinks } from '@/components'
import { ModalLayout } from '@/components/HeadlessUI'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import withSuspense from '@/helpers/suspense.helper'
import React, { lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ViewTasks = withSuspense(lazy(() => import('./Components/ViewTasks')))
const AddTaskModal = withSuspense(lazy(() => import('./Components/AddTaskModal')))

type ModalState = {
	isAddTaskVisible: boolean
	reloadTasks: boolean
}

const ManageTasks: React.FC = () => {
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
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
				{userHasPermission(PermissionTypes.Permissions_ManageTasks_Create) && (
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
