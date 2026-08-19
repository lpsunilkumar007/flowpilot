import { FormInput, PopupBody, PopupFooter, PopupHeader, PopupWrapper, VerticalForm } from '@/components'
import type { UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { offeringService } from '@/services/OfferingService'
import { OfferingStatus, OfferingType, type CreateOfferingRequest, type ViewOfferingResponse } from '@/types/crm/offering.types'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'
import { toEnumOptionValue } from '../helpers/offeringDisplay.helper'

interface AddOfferingModalProps {
	offering: ViewOfferingResponse | null
	users: UserDropDownItemResponse[]
	onClose: (saved: boolean) => void
}

type OfferingFormValues = {
	name: string
	type: string
	status: string
	description?: string
	ownerUserId: string
	expectedValueFrom?: number | string
	expectedValueTo?: number | string
}

const toNumberOrUndefined = (value?: number | string) => {
	if (value === undefined || value === null || value === '') return undefined
	return Number(value)
}

const AddOfferingModal: React.FC<AddOfferingModalProps> = ({ offering, users, onClose }) => {
	const { t } = useTranslation()
	const isEdit = Boolean(offering)

	const schemaResolver = yupResolver(
		yup.object().shape({
			name: yup.string().trim().required('This field cannot be left empty'),
			type: yup.string().required('Please select a value'),
			status: yup.string().required('Please select a value'),
			ownerUserId: yup.string().required('Please select a value'),
			expectedValueFrom: yup
				.number()
				.transform((value, originalValue) => (originalValue === '' ? undefined : value))
				.nullable(),
			expectedValueTo: yup
				.number()
				.transform((value, originalValue) => (originalValue === '' ? undefined : value))
				.nullable()
				.test('range', 'Expected value to must be greater than or equal to from', function (value) {
					const from = this.parent.expectedValueFrom
					return !from || !value || value >= from
				}),
		})
	)

	const defaultValues: OfferingFormValues = offering
		? {
				name: offering.name,
				type: toEnumOptionValue(OfferingType, offering.type),
				status: toEnumOptionValue(OfferingStatus, offering.status),
				description: offering.description ?? '',
				ownerUserId: offering.ownerUserId,
				expectedValueFrom: offering.expectedValueFrom ?? '',
				expectedValueTo: offering.expectedValueTo ?? '',
			}
		: {
				name: '',
				type: String(OfferingType.Product),
				status: String(OfferingStatus.Active),
				description: '',
				ownerUserId: users[0]?.strValue ?? '',
				expectedValueFrom: '',
				expectedValueTo: '',
			}

	const handleSubmit = async (values: OfferingFormValues) => {
		const payload: CreateOfferingRequest = {
			name: values.name.trim(),
			type: Number(values.type) as OfferingType,
			status: Number(values.status) as OfferingStatus,
			description: values.description?.trim() || undefined,
			ownerUserId: values.ownerUserId,
			expectedValueFrom: toNumberOrUndefined(values.expectedValueFrom),
			expectedValueTo: toNumberOrUndefined(values.expectedValueTo),
		}

		const action = offering
			? () => offeringService.update(offering.id, { ...payload, id: offering.id })
			: () => offeringService.create(payload)

		await runWithToast(action, {
			onSuccess: (response: string | { message?: string }) => {
				messageHelper.showSuccess(typeof response === 'string' ? response : response.message ?? '')
				onClose(true)
			},
		})
	}

	return (
		<PopupWrapper variant="default">
			<PopupHeader title={isEdit ? t('Manage.Offerings.Edit_Title', 'Edit Offering') : t('Manage.Offerings.Add_Title', 'New Offering')} onClose={() => onClose(false)} />
			<VerticalForm<OfferingFormValues> key={offering?.id ?? 'new'} onSubmit={handleSubmit} resolver={schemaResolver as never} defaultValues={defaultValues}>
				<PopupBody>
					<div className="grid gap-5">
						<FormInput label={t('Manage.Offerings.Name', 'Name')} name="name" type="text" required className="form-input" />
						<div className="grid gap-5 sm:grid-cols-2">
							<FormInput label={t('Manage.Offerings.Type', 'Type')} name="type" type="bottom-sheet" required className="form-select">
								<option value={OfferingType.Product}>{formatHelper.punctuateLabel(OfferingType[OfferingType.Product])}</option>
								<option value={OfferingType.Project}>{formatHelper.punctuateLabel(OfferingType[OfferingType.Project])}</option>
							</FormInput>
							<FormInput label={t('Manage.Offerings.Status', 'Status')} name="status" type="bottom-sheet" required className="form-select">
								<option value={OfferingStatus.Active}>{formatHelper.punctuateLabel(OfferingStatus[OfferingStatus.Active])}</option>
								<option value={OfferingStatus.Inactive}>{formatHelper.punctuateLabel(OfferingStatus[OfferingStatus.Inactive])}</option>
							</FormInput>
						</div>
						<FormInput label={t('Manage.Offerings.Owner', 'Owner')} name="ownerUserId" type="bottom-sheet" required className="form-select">
							{users.map((u) => (
								<option key={u.strValue} value={u.strValue}>
									{u.text}
								</option>
							))}
						</FormInput>
						<div className="grid gap-5 sm:grid-cols-2">
							<FormInput label={t('Manage.Offerings.ExpectedValueFrom', 'Expected value from')} name="expectedValueFrom" type="number" className="form-input" />
							<FormInput label={t('Manage.Offerings.ExpectedValueTo', 'Expected value to')} name="expectedValueTo" type="number" className="form-input" />
						</div>
						<FormInput label={t('Manage.Offerings.Description', 'Description')} name="description" type="textarea" rows={4} className="form-input" />
					</div>
				</PopupBody>
				<PopupFooter>
					<button type="button" className="btn btn-secondary" onClick={() => onClose(false)}>
						{t('Common.Cancel', 'Cancel')}
					</button>
					<button className="btn btn-primary">{t('Common.Save', 'Save')}</button>
				</PopupFooter>
			</VerticalForm>
		</PopupWrapper>
	)
}

export default AddOfferingModal
