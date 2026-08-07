import { FormInput } from '@/components'
import type { UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import React, { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface AssignSalesPersonFieldsProps {
	users: UserDropDownItemResponse[]
	assignedLabel?: string
}

const AssignSalesPersonFields: React.FC<AssignSalesPersonFieldsProps> = ({ users, assignedLabel }) => {
	const { t } = useTranslation()
	const { register, control, setValue, watch, formState: { errors } } = useFormContext()
	const assignToYourself = !!watch('assignToYourself')

	useEffect(() => {
		if (assignToYourself) {
			setValue('assignedToUserId', '', { shouldValidate: true })
		}
	}, [assignToYourself, setValue])

	return (
		<>
			<div>
				<label className="form-label" htmlFor="assignToYourself">
					{t('Manage.Leads.AssignToYourself', 'Assign to yourself')}
				</label>
				<div className="flex items-center">
					<input
						id="assignToYourself"
						type="checkbox"
						className="form-switch text-primary"
						checked={assignToYourself}
						onChange={(e) => setValue('assignToYourself', e.target.checked, { shouldValidate: true })}
					/>
				</div>
			</div>
			{!assignToYourself && (
				<FormInput
					label={assignedLabel ?? t('Manage.Leads.AssignedTo', 'Assigned Sales Person')}
					required
					name="assignedToUserId"
					type="bottom-sheet"
					className="form-select"
					register={register}
					control={control}
					errors={errors}
				>
					<option value="">{t('Common.Select', 'Select')}</option>
					{users.map((u) => (
						<option key={u.strValue} value={u.strValue}>
							{u.text}
						</option>
					))}
				</FormInput>
			)}
		</>
	)
}

export default AssignSalesPersonFields
