import { messageHelper } from '@/helpers/message.helper'
import {
	MAX_CUSTOM_FIELD_LABEL_LENGTH,
	MAX_CUSTOM_FIELD_VALUE_LENGTH,
	MAX_CUSTOM_FIELDS_PER_ENTITY,
	type EntityCustomFieldItemRequest,
	type ViewEntityCustomFieldResponse,
} from '@/types/common/customField.types'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'

type FieldRow = {
	key: string
	id?: number
	label: string
	value: string
}

type FieldRowErrors = {
	label?: string
	value?: string
}

export interface EntityCustomFieldsHandle {
	getFields: () => EntityCustomFieldItemRequest[]
	validate: () => boolean
}

interface EntityCustomFieldsProps {
	entityId: number
	initialFields?: ViewEntityCustomFieldResponse[]
	readOnly?: boolean
	embedded?: boolean
	title?: string
	subtitle?: string
	className?: string
}

const cardClass = 'rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'

const toRows = (fields: ViewEntityCustomFieldResponse[]): FieldRow[] =>
	fields.map((field) => ({
		key: `saved-${field.id}`,
		id: field.id,
		label: field.label ?? '',
		value: field.value ?? '',
	}))

const newRow = (): FieldRow => ({
	key: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
	label: '',
	value: '',
})

const buildPayload = (fields: FieldRow[]): EntityCustomFieldItemRequest[] =>
	fields
		.map((field, index) => ({
			id: field.id,
			label: field.label.trim(),
			value: field.value.trim(),
			displayOrder: index,
		}))
		.filter((field) => field.label || field.value)

const EntityCustomFields = forwardRef<EntityCustomFieldsHandle, EntityCustomFieldsProps>(
	({ entityId, initialFields, readOnly = false, embedded = false, title, subtitle, className = '' }, ref) => {
		const { t } = useTranslation()
		const isCreateMode = entityId <= 0
		const canUpdate = !readOnly
		const [fields, setFields] = useState<FieldRow[]>(isCreateMode ? [newRow()] : toRows(initialFields ?? []))
		const [showErrors, setShowErrors] = useState(false)
		const [requireCompleteRows, setRequireCompleteRows] = useState(false)

		const heading = title ?? t('Common.CustomFields', 'Custom fields')
		const description = subtitle ?? t('Common.CustomFields_Sub', 'Add extra name and value pairs for this record')
		const requiredMessage = t('Common.Required', 'This field cannot be left empty')

		const computeErrors = (rows: FieldRow[], requireCompleteRows = false): Record<string, FieldRowErrors> => {
			const errors: Record<string, FieldRowErrors> = {}
			const labelCounts = new Map<string, number>()

			for (const row of rows) {
				const labelKey = row.label.trim().toLowerCase()
				if (labelKey) {
					labelCounts.set(labelKey, (labelCounts.get(labelKey) ?? 0) + 1)
				}
			}

			for (const row of rows) {
				const label = row.label.trim()
				const value = row.value.trim()
				if (!label && !value && !requireCompleteRows) continue

				const rowErrors: FieldRowErrors = {}
				if (!label) {
					rowErrors.label = requiredMessage
				} else if (label.length > MAX_CUSTOM_FIELD_LABEL_LENGTH) {
					rowErrors.label = t('Common.CustomFields.NameTooLong', 'This field cannot be longer than {{count}} characters', {
						count: MAX_CUSTOM_FIELD_LABEL_LENGTH,
					})
				} else if ((labelCounts.get(label.toLowerCase()) ?? 0) > 1) {
					rowErrors.label = t('Common.CustomFields.UniqueName', 'Each custom field must have a unique name.')
				}

				if (!value) {
					rowErrors.value = requiredMessage
				} else if (value.length > MAX_CUSTOM_FIELD_VALUE_LENGTH) {
					rowErrors.value = t('Common.CustomFields.ValueTooLong', 'This field cannot be longer than {{count}} characters', {
						count: MAX_CUSTOM_FIELD_VALUE_LENGTH,
					})
				}

				if (rowErrors.label || rowErrors.value) {
					errors[row.key] = rowErrors
				}
			}

			return errors
		}

		const fieldErrors = showErrors ? computeErrors(fields, requireCompleteRows) : {}

		const validateRows = (rows: FieldRow[], options?: { requireCompleteRows?: boolean; showToastForLimit?: boolean }): boolean => {
			if (rows.filter((row) => row.label.trim() || row.value.trim()).length > MAX_CUSTOM_FIELDS_PER_ENTITY) {
				if (options?.showToastForLimit) {
					messageHelper.showError(t('Common.CustomFields.Limit', 'Cannot add more than {{count}} fields.', { count: MAX_CUSTOM_FIELDS_PER_ENTITY }))
				}
				return false
			}

			return Object.keys(computeErrors(rows, options?.requireCompleteRows)).length === 0
		}

		const scrollToFirstError = () => {
			window.setTimeout(() => {
				document.querySelector<HTMLElement>('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}, 0)
		}

		useImperativeHandle(ref, () => ({
			getFields: () => buildPayload(fields),
			validate: () => {
				setRequireCompleteRows(false)
				setShowErrors(true)
				const isValid = validateRows(fields, { showToastForLimit: true })
				if (!isValid) scrollToFirstError()
				return isValid
			},
		}))

		const addField = () => {
			setRequireCompleteRows(true)
			setShowErrors(true)
			if (!validateRows(fields, { requireCompleteRows: true })) {
				scrollToFirstError()
				return
			}
			if (fields.length >= MAX_CUSTOM_FIELDS_PER_ENTITY) {
				messageHelper.showError(t('Common.CustomFields.Limit', 'Cannot add more than {{count}} fields.', { count: MAX_CUSTOM_FIELDS_PER_ENTITY }))
				return
			}
			setFields([...fields, newRow()])
			setShowErrors(false)
			setRequireCompleteRows(false)
		}

		const removeField = (key: string) => {
			setFields(fields.filter((field) => field.key !== key))
		}

		const updateField = (key: string, name: 'label' | 'value', value: string) => {
			setFields(fields.map((field) => (field.key === key ? { ...field, [name]: value } : field)))
		}

		const header = (
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<i className="ri-list-settings-line text-lg" />
				</div>
				<div>
					<h3 className={`${embedded ? 'text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300' : 'text-base font-semibold text-gray-900 dark:text-gray-100'}`}>{heading}</h3>
					<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
				</div>
			</div>
		)

		const body = (
			<div className="space-y-4">
				{fields.length === 0 && <p className="py-2 text-center text-sm text-gray-500">{t('Common.CustomFields.Empty', 'No custom fields yet.')}</p>}

				{fields.map((field) => {
					const errors = fieldErrors[field.key]
					if (!canUpdate) {
						return (
							<div key={field.key}>
								<div className="form-label">{field.label}</div>
								<div className="break-words text-gray-900 dark:text-gray-100">{field.value}</div>
							</div>
						)
					}

					const removeButtonClass = 'btn shrink-0 rounded-l-none bg-danger text-white'

					return (
						<div key={field.key} className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:grid-cols-2">
							<div className="min-w-0">
								<label className="form-label" htmlFor={`custom-field-name-${field.key}`}>
									{t('Common.CustomFields.FieldName', 'Field name')}
									<span className="text-danger"> *</span>
								</label>
								<div className="flex">
									<input
										id={`custom-field-name-${field.key}`}
										type="text"
										maxLength={MAX_CUSTOM_FIELD_LABEL_LENGTH}
										className={`form-input min-w-0 flex-1 ${errors?.label ? 'border-red-500 focus:border-red-500 text-red-700' : ''}`}
										value={field.label}
										aria-invalid={Boolean(errors?.label)}
										onChange={(e) => updateField(field.key, 'label', e.target.value)}
									/>
								</div>
								{errors?.label && <p className="mt-2 text-xs text-red-600">{errors.label}</p>}
							</div>
							<div className="min-w-0">
								<label className="form-label" htmlFor={`custom-field-value-${field.key}`}>
									{t('Common.CustomFields.FieldValue', 'Field value')}
									<span className="text-danger"> *</span>
								</label>
								<div className="flex">
									<input
										id={`custom-field-value-${field.key}`}
										type="text"
										maxLength={MAX_CUSTOM_FIELD_VALUE_LENGTH}
										className={`form-input min-w-0 flex-1 rounded-r-none ${errors?.value ? 'border-red-500 focus:border-red-500 text-red-700' : ''}`}
										value={field.value}
										aria-invalid={Boolean(errors?.value)}
										onChange={(e) => updateField(field.key, 'value', e.target.value)}
									/>
									<button type="button" className={removeButtonClass} onClick={() => removeField(field.key)} aria-label={t('Common.Remove', 'Remove')}>
										<i className="ri-subtract-fill" />
									</button>
								</div>
								{errors?.value && <p className="mt-2 text-xs text-red-600">{errors.value}</p>}
							</div>
						</div>
					)
				})}

				{canUpdate && (
					<div className="flex justify-center border-t border-gray-100 pt-4 dark:border-gray-700">
						<button type="button" className="btn bg-primary text-white" onClick={addField} disabled={fields.length >= MAX_CUSTOM_FIELDS_PER_ENTITY}>
							<i className="ri-add-fill mr-1 text-lg" />
							{t('Common.CustomFields.AddField', 'Add field')}
						</button>
					</div>
				)}
			</div>
		)

		if (embedded) {
			return (
				<div className={`mt-6 border-t border-gray-100 pt-5 dark:border-gray-700 ${className}`}>
					<div className="mb-4">{header}</div>
					{body}
				</div>
			)
		}

		return (
			<section className={`${cardClass} overflow-hidden ${className}`}>
				<div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-700">{header}</div>
				<div className="p-5">{body}</div>
			</section>
		)
	}
)

EntityCustomFields.displayName = 'EntityCustomFields'

export default EntityCustomFields
