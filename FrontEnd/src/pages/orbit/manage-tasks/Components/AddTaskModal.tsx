import { EntityCustomFields, FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm, type EntityCustomFieldsHandle } from '@/components'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { taskService } from '@/services/TaskService'
import { TaskBucket, TaskPriority, TaskType, type CreateTaskRequest } from '@/types/crm/task.types'
import moment from 'moment'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { buildWhenFromBucketAndTime } from '../helpers/taskDisplay.helper'
// form validation
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface AddTaskModalProps {
	addTaskOutput: (isAdded: boolean) => void
}

type AddTaskFormValues = {
	title: string
	when: string
	bucket: string
	type: string
	priority: string
}

const AddTaskModal: React.FC<AddTaskModalProps> = (props) => {
	const { userHasPermission } = usePermission()
	const { t } = useTranslation()
	const defaultWhen = moment().add(1, 'hour').startOf('hour').format('HH:mm')
	const customFieldsRef = useRef<EntityCustomFieldsHandle>(null)
	const schemaResolver = yupResolver(
		yup.object().shape({
			title: yup.string().trim().required('This field cannot be left empty'),
			when: yup.string().required('This field cannot be left empty'),
		})
	)

	const onSubmit = async (formData: AddTaskFormValues) => {
		if (customFieldsRef.current && !customFieldsRef.current.validate()) {
			return
		}

		const bucket = Number(formData.bucket) as TaskBucket
		const when = buildWhenFromBucketAndTime(bucket, formData.when)

		const payload: CreateTaskRequest = {
			title: formData.title.trim(),
			when: when.toISOString(),
			bucket,
			type: formData.type !== '' ? (Number(formData.type) as TaskType) : TaskType.Task,
			priority: formData.priority !== '' ? (Number(formData.priority) as TaskPriority) : TaskPriority.Medium,
			customFieldRequests: customFieldsRef.current?.getFields() ?? [],
		}

		await runWithToast(() => taskService.create(payload), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response.message)
				props.addTaskOutput(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Tasks.Add_Title', 'New Task')} onClose={() => props.addTaskOutput(false)} />
				<VerticalForm<any>
					onSubmit={onSubmit}
					resolver={schemaResolver}
					defaultValues={{
						title: '',
						when: defaultWhen,
						bucket: String(TaskBucket.Today),
						type: String(TaskType.Task),
						priority: String(TaskPriority.Medium),
					}}
				>
					<PopupBody>
						<div className="grid lg:grid-cols-1 gap-6">
							<FormInput label={t('Manage.Tasks.Title', 'Title')} labelClassName="form-label" containerClass="form-field" name="title" type="text" required placeholder={t('Manage.Tasks.Title_Placeholder', 'Call Sarah Chen — Solaris Labs')} className="form-input" key="title" />
							<div className="grid gap-6 sm:grid-cols-2">
								<FormInput label={t('Manage.Tasks.When', 'When')} labelClassName="form-label" containerClass="form-field" name="when" type="time" required className="form-input" key="when" />
								<FormInput label={t('Manage.Tasks.Bucket', 'Bucket')} labelClassName="form-label" containerClass="form-field" name="bucket" type="bottom-sheet" className="form-select" key="bucket">
									{[TaskBucket.Today, TaskBucket.Tomorrow, TaskBucket.Overdue, TaskBucket.Future].map((opt) => (
										<option key={opt} value={opt}>
											{formatHelper.punctuateLabel(TaskBucket[opt])}
										</option>
									))}
								</FormInput>
							</div>
							<div className="grid gap-6 sm:grid-cols-2">
								<FormInput label={t('Manage.Tasks.Type', 'Type')} labelClassName="form-label" containerClass="form-field" name="type" type="bottom-sheet" className="form-select" key="type">
									{Object.values(TaskType)
										.filter((v) => typeof v === 'number')
										.map((opt) => (
											<option key={opt} value={opt}>
												{formatHelper.punctuateLabel(TaskType[opt as number])}
											</option>
										))}
								</FormInput>
								<FormInput label={t('Manage.Tasks.Priority', 'Priority')} labelClassName="form-label" containerClass="form-field" name="priority" type="bottom-sheet" className="form-select" key="priority">
									{Object.values(TaskPriority)
										.filter((v) => typeof v === 'number')
										.map((opt) => (
											<option key={opt} value={opt}>
												{formatHelper.punctuateLabel(TaskPriority[opt as number])}
											</option>
										))}
								</FormInput>
							</div>
							<EntityCustomFields ref={customFieldsRef} entityId={0} />
						</div>
					</PopupBody>
					<PopupFooter>
						<button type="button" className="btn btn-secondary" onClick={() => props.addTaskOutput(false)}>
							{t('Manage.Tasks.Add_Close', 'Close')}
						</button>
						{userHasPermission(PermissionTypes.Permissions_ManageTasks_Create) && <button className="btn btn-primary">{t('Manage.Tasks.Add_Save', 'Save')}</button>}
					</PopupFooter>
				</VerticalForm>
			</PopupWrapper>
		</>
	)
}

export default AddTaskModal
