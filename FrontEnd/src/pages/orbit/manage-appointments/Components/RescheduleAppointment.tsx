import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import FormInput from '@/components/FormInput'
import { PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import AppointmentTime from './AppointmentTime'
import { AppointmentApprovalRule, AppointmentLocationType, AppointmentParticipantRole, CreateAppointmentAvailabilityWindowRequest, CreateAppointmentParticipantRequest, RescheduleAppointmentRequest, ViewAppointmentRequestResponse } from '@/helpers/api/WebApiClient'
import { appointmentRequestService } from '@/services/AppointmentRequestService'
import { messageHelper } from '@/helpers/message.helper'
import { formatHelper } from '@/helpers/format.helper'
import ParticipantWithTimeZone from './ParticipantWithTimeZone'
import { useTranslation } from 'react-i18next'
import useObjectState from '@/hooks/useObjectState'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'

interface FormValues {
	title: string
	Description?: string
	durationMinutes: number
	locationType: AppointmentLocationType
	approvalRule: AppointmentApprovalRule
	multipleParticipantPerSlot?: number
}

interface RescheduleAppointmentProps {
	rescheduleAppointmentOutPut: (isAdded: boolean) => void
	id: number
}

type ModalState = {
	timeRows: any[]
	isTimeValid: boolean
	required: any[]
	optional: any[]
	eventDetailData?: ViewAppointmentRequestResponse
}

const RescheduleAppointment = (props: RescheduleAppointmentProps) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const { state: modalState, setKey: setModalKey } = useObjectState<ModalState>({
		timeRows: [],
		isTimeValid: true,
		required: [],
		optional: [],
		eventDetailData: new ViewAppointmentRequestResponse(),
	})

	const modalRef = useRef<HTMLDivElement | null>(null)

	const methods = useForm<FormValues>({
		defaultValues: {
			title: '',
			Description: '',
			durationMinutes: 30,
			locationType: AppointmentLocationType.InPerson,
			approvalRule: AppointmentApprovalRule.HostConfirms,
		},
	})

	const {
		handleSubmit,
		register,
		control,
		watch,
		formState: { errors },
		setValue,
	} = methods

	const approvalRule = watch('approvalRule')
	const showMultipleParticipantField = approvalRule === AppointmentApprovalRule.CreateAppointmentForTheParticipantOnceApprovedByThatParticipantMultiplePerSlot
	const showAddParticipantWindow = approvalRule === AppointmentApprovalRule.HostConfirms

	useEffect(() => {
		const fetchDetail = async () => {
			const res = await appointmentRequestService.getById(props.id)

			const existingSlots = res.availabilityWindow || []
			const mappedTimeRows = existingSlots.map((slot: any) => ({
				date: moment(slot.onDate).format('YYYY-MM-DD'),
				fromTime: moment(slot.timeFrom, 'HH:mm:ss').format('HH:mm'),
				toTime: moment(slot.timeTo, 'HH:mm:ss').format('HH:mm'),
			}))

			const existingParticipants = res.appointmentParticipants || []
			const req = existingParticipants.filter((p: any) => p.appointmentParticipantRole === AppointmentParticipantRole.Required)
			const opt = existingParticipants.filter((p: any) => p.appointmentParticipantRole === AppointmentParticipantRole.Optional)

			const mapToParticipantWithTimeZone = (p: any) => {
				const detail = p.participantDetail || {}
				const fallbackName = `${detail.firstName || ''} ${detail.lastName || ''}`.trim()

				return {
					timeZone: detail.timeZone,
					user: {
						...detail,
						strValue: String(detail.id ?? ''),
						text: fallbackName,
						timeZone: detail.timeZone,
					},
				}
			}

			setModalKey('eventDetailData', res)
			setModalKey('timeRows', mappedTimeRows)
			setModalKey('required', req.map(mapToParticipantWithTimeZone))
			setModalKey('optional', opt.map(mapToParticipantWithTimeZone))
			setValue('title', res.title)
			setValue('Description', res.description || '')
			setValue('durationMinutes', res.durationMinutes)
			setValue('locationType', res.locationType)
			setValue('approvalRule', res.approvalRule)
			if (res.multipleParticipantPerSlot) {
				setValue('multipleParticipantPerSlot', res.multipleParticipantPerSlot)
			}
		}
		fetchDetail()
	}, [props.id, setValue])

	useEffect(() => {
		if (modalRef.current) {
			setTimeout(() => {
				const firstFocusable = modalRef.current?.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])')
					; (firstFocusable || modalRef.current)?.focus()
			}, 50)
		}
	}, [])

	const onSubmitReschedule = async (formValues: FormValues) => {
		const { title, durationMinutes, locationType, Description, approvalRule, multipleParticipantPerSlot } = formValues

		const participantsPayload = [
			...modalState.required.map(
				(p) =>
					new CreateAppointmentParticipantRequest({
						fkApplicationUserPKId: String(p.user?.strValue),
						appointmentParticipantRole: AppointmentParticipantRole.Required,
						timeZone: p.timeZone || p.user?.timeZone,
					})
			),
			...modalState.optional.map(
				(p) =>
					new CreateAppointmentParticipantRequest({
						fkApplicationUserPKId: String(p.user?.strValue),
						appointmentParticipantRole: AppointmentParticipantRole.Optional,
						timeZone: p.timeZone || p.user?.timeZone,
					})
			),
		]

		const formattedWindows = modalState.timeRows.map(
			(slot: any) =>
				new CreateAppointmentAvailabilityWindowRequest({
					onDate: moment(slot.date, 'YYYY-MM-DD'),
					timeFrom: moment(`${slot.date} ${slot.fromTime}`, 'YYYY-MM-DD HH:mm'),
					timeTo: moment(`${slot.date} ${slot.toTime}`, 'YYYY-MM-DD HH:mm'),
				})
		)

		const payload = new RescheduleAppointmentRequest({
			fkTempAppointmentsPKId: modalState.eventDetailData?.id ?? -1,
			title: String(title),
			description: String(Description || ''),
			durationMinutes: Number(durationMinutes),
			approvalRule: approvalRule,
			locationType: locationType,
			appointmentParticipants: participantsPayload,
			appointmentAvailabilityWindows: formattedWindows,
			...(multipleParticipantPerSlot && {
				multipleParticipantPerSlot: Number(multipleParticipantPerSlot),
			}),
		})

		payload.approvalRule = payload.approvalRule.length === 0 ? ('-1' as unknown as AppointmentApprovalRule) : payload.approvalRule
		payload.locationType = payload.locationType.length === 0 ? ('-1' as unknown as AppointmentLocationType) : payload.locationType

		await runWithToast(() => appointmentRequestService.rescheduleAppointment(payload), {
			onSuccess: (response: any) => {
				messageHelper.showSuccess(response.message)
				props.rescheduleAppointmentOutPut(false)
			},
		})
	}

	return (
		<PopupWrapper variant="appointment">
			<div ref={modalRef} tabIndex={-1}>
				<PopupHeader title={t('Manage.Appointments.Reschedule_Heading', 'Reschedule Appointment')} onClose={() => props.rescheduleAppointmentOutPut(false)} />

				<form onSubmit={handleSubmit(onSubmitReschedule)}>
					<PopupBody>
						<div className="grid lg:grid-cols-2 gap-6">
							<div className="lg:col-span-2">
								<FormInput type="text" label={t('Manage.Appointments.Reschedule_Title', 'Title')} labelClassName="form-label" name="title" className="form-input" placeholder={t('Manage.Appointments.Reschedule.Placeholder_EnterTitle', 'Enter Title')} containerClass="form-field" register={register} errors={errors} control={control} required />
							</div>
							<div className="lg:col-span-2 grid lg:grid-cols-3 gap-6">
								<FormInput type="bottom-sheet" label={t('Manage.Appointments.Reschedule_LocationType', 'Location Type')} labelClassName="form-label" name="locationType" className="form-select" containerClass="form-field" register={register} errors={errors} control={control} required>
									<option value="">{t('Manage.Appointments.Reschedule.DD_SelectLocation', 'Select Location')}</option>
									{Object.values(AppointmentLocationType).map((loc) => (
										<option key={loc} value={loc}>
											{loc}
										</option>
									))}
								</FormInput>

								<FormInput type="bottom-sheet" label={t('Manage.Appointments.Reschedule_Duration', 'Duration')} labelClassName="form-label" name="durationMinutes" className="form-select" containerClass="form-field" register={register} errors={errors} control={control} required>
									<option value="">Select Duration</option>
									<option value="30">30 Minutes</option>
									<option value="60">1 Hour</option>
									<option value="90">1.30 Hours</option>
									<option value="120">2 Hours</option>
								</FormInput>

								<FormInput type="bottom-sheet" label={t('Manage.Appointments.Reschedule_AppointmentApproval', 'Appointment Approval')} name="approvalRule" labelClassName="form-label" className="form-select" containerClass="form-field" register={register} key="approvalRule" errors={errors} control={control}>
									<option value="">{t('Manage.Appointments.Reschedule.DD_SelectApprovalRule', 'Select Approval Rule')}</option>

									{Object.values(AppointmentApprovalRule).map((loc) => (
										<option key={loc} value={loc}>
											{formatHelper.punctuateLabel(loc)}
										</option>
									))}
								</FormInput>
							</div>
							{showMultipleParticipantField && (
								<div className="lg:col-span-2">
									<FormInput type="number" label="Multiple Participant Per Slot" labelClassName="form-label" name="multipleParticipantPerSlot" className="form-input" placeholder="Enter number of participants per slot" containerClass="form-field" register={register} key="multipleParticipantPerSlot" errors={errors} control={control} />
								</div>
							)}
							<div className="lg:col-span-2">
								<AppointmentTime
									hideAddButton={showAddParticipantWindow}
									value={modalState.timeRows}
									onChange={(list) => {
										setModalKey('timeRows', list)
										setModalKey(
											'isTimeValid',
											list.some((r) => r.date && r.fromTime && r.toTime)
										)
									}}
								/>
							</div>
							<div className="lg:col-span-2">
								<ParticipantWithTimeZone label={t('Manage.Appointments.Reschedule_InviteRequired', 'Required Participants')} value={modalState.required} excludedParticipants={modalState.optional} onChange={(list) => setModalKey('required', list)} />
							</div>
							<div className="lg:col-span-2">
								<ParticipantWithTimeZone label={t('Manage.Appointments.Reschedule_InviteOptional', 'Optional Participants')} value={modalState.optional} excludedParticipants={modalState.required} onChange={(list) => setModalKey('optional', list)} />
							</div>
							<div className="lg:col-span-2">
								<FormInput type="textarea" label={t('Manage.Appointments.Reschedule_Description', 'Description')} labelClassName="form-label" name="Description" className="form-textarea-tall" placeholder={t('Manage.Appointments.Reschedule.Placeholder_EnterDescription', 'Enter Description')} containerClass="form-field" register={register} errors={errors} control={control} />
							</div>
						</div>
					</PopupBody>

					<PopupFooter>
						<button className="btn btn-secondary" onClick={() => props.rescheduleAppointmentOutPut(false)} type="button">
							{t('Manage.Appointments.Reschedule_Close', 'Close')}
						</button>
						{userHasPermission(PermissionTypes.Permissions_ManageAppointments_Create) && (
							<button className="btn btn-primary" type="submit">
								{t('Manage.Appointments.Reschedule_CreateRescheduled', 'Create Rescheduled')}
							</button>
						)}
					</PopupFooter>
				</form>
			</div>
		</PopupWrapper>
	)
}

export default RescheduleAppointment
