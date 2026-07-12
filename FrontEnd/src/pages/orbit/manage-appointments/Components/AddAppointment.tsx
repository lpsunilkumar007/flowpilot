import { useState } from 'react'
import { useForm } from 'react-hook-form'
import FormInput from '@/components/FormInput'
import { PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import AppointmentTime from './AppointmentTime'
import { AppointmentApprovalRule, AppointmentLocationType, AppointmentParticipantRole, CreateAppointmentAvailabilityWindowRequest, CreateAppointmentParticipantRequest, CreateAppointmentRequest } from '@/helpers/api/WebApiClient'
import { appointmentRequestService } from '@/services/AppointmentRequestService'
import moment from 'moment'
import { messageHelper } from '@/helpers/message.helper'
import { formatHelper } from '@/helpers/format.helper'
import ParticipantWithTimeZone from './ParticipantWithTimeZone'
import { useTranslation } from 'react-i18next'
import useObjectState from '@/hooks/useObjectState'
import { runWithToast } from '@/helpers/asyncToast.helper'

interface FormValues {
	title: string
	Description?: string
	durationMinutes: number
	locationType: AppointmentLocationType
	approvalRule: AppointmentApprovalRule
	multipleParticipantPerSlot: number
}

interface AddAppointmentEventProps {
	addNewAppointmentOutPut: (isAdded: boolean) => void
}

type ModalState = {
	timeRows: any[]
	isTimeValid: boolean
	required: any[]
	optional: any[]
}

const AddAppointmentEvent = ({ addNewAppointmentOutPut }: AddAppointmentEventProps) => {
	const { t } = useTranslation()
	const [selectedApprovalRule, setSelectedApprovalRule] = useState<AppointmentApprovalRule | ''>('')
	const { state: modalState, setKey: setModalKey } = useObjectState<ModalState>({
		timeRows: [],
		isTimeValid: false,
		required: [],
		optional: [],
	})

	const methods = useForm<FormValues>({})
	const {
		handleSubmit,
		register,
		control,
		formState: { errors },
	} = methods

	const showMultipleParticipantField = selectedApprovalRule === AppointmentApprovalRule.CreateAppointmentForTheParticipantOnceApprovedByThatParticipantMultiplePerSlot
	const showAddParticipantWindow = selectedApprovalRule === AppointmentApprovalRule.HostConfirms
	const onSubmitEvent = async (formValues: FormValues) => {
		const { title, durationMinutes, locationType, Description, approvalRule, multipleParticipantPerSlot } = formValues

		for (const slot of modalState.timeRows) {
			if (!slot.date) {
				messageHelper.showInlineError(`date_${slot.id}`, 'Please select a date.')
				return
			}
			if (!slot.fromTime) {
				messageHelper.showInlineError(`fromTime_${slot.id}`, 'Please select a start time.')
				return
			}
			if (!slot.toTime) {
				messageHelper.showInlineError(`toTime_${slot.id}`, 'Please select an end time.')
				return
			}
		}
		const now = moment()
		for (const slot of modalState.timeRows) {
			const start = moment(`${slot.date} ${slot.fromTime}`, 'YYYY-MM-DD HH:mm')
			if (start.isBefore(now)) {
				messageHelper.showError('Selected date or time cannot be in the past.')
				return
			}
		}

		const participantsPayload = [
			...modalState.required.map(
				(p) =>
					new CreateAppointmentParticipantRequest({
						fkApplicationUserPKId: String(p.user.strValue),
						appointmentParticipantRole: AppointmentParticipantRole.Required,
						timeZone: p.timeZone,
					})
			),
			...modalState.optional.map(
				(p) =>
					new CreateAppointmentParticipantRequest({
						fkApplicationUserPKId: String(p.user.strValue),
						appointmentParticipantRole: AppointmentParticipantRole.Optional,
						timeZone: p.timeZone,
					})
			),
		]

		const formattedWindows = modalState.timeRows.map(
			(slot: any) =>
				new CreateAppointmentAvailabilityWindowRequest({
					...(slot.date && {
						onDate: moment(slot.date, 'YYYY-MM-DD'),
					}),
					...(slot.date &&
						slot.fromTime && {
						timeFrom: moment(`${slot.date} ${slot.fromTime}`, 'YYYY-MM-DD HH:mm'),
					}),
					...(slot.date &&
						slot.toTime && {
						timeTo: moment(`${slot.date} ${slot.toTime}`, 'YYYY-MM-DD HH:mm'),
					}),
				})
		)
		const payload = new CreateAppointmentRequest({
			title: String(title),
			description: String(Description || ''),
			durationMinutes: Number(durationMinutes),
			approvalRule: approvalRule,
			locationType: locationType,
			appointmentParticipants: participantsPayload,
			appointmentAvailabilityWindows: formattedWindows,
			multipleParticipantPerSlot: approvalRule === AppointmentApprovalRule.CreateAppointmentForTheParticipantOnceApprovedByThatParticipantMultiplePerSlot ? Number(multipleParticipantPerSlot) : 1,
		})

		payload.approvalRule = payload.approvalRule.length === 0 ? ('-1' as unknown as AppointmentApprovalRule) : payload.approvalRule
		payload.locationType = payload.locationType.length === 0 ? ('-1' as unknown as AppointmentLocationType) : payload.locationType

		await runWithToast(() => appointmentRequestService.create(payload), {
			onSuccess: (response: any) => {
				messageHelper.showSuccess(response.message)
				addNewAppointmentOutPut(true)
			},
		})
	}

	return (
		<PopupWrapper variant="appointment">
			<PopupHeader title={t('Manage.Appointments.Add_Heading', 'Add Appointment')} onClose={() => addNewAppointmentOutPut(false)} />
			<form onSubmit={handleSubmit(onSubmitEvent)}>
				<PopupBody>
					<div className="grid lg:grid-cols-2 gap-6">
						<div className="lg:col-span-2">
							<FormInput type="text" label={t('Manage.Appointments.Add_Title', 'Title')} labelClassName="form-label" containerClass="form-field" name="title" className="form-input" placeholder={t('Manage.Appointments.Add.Placeholder_EnterTitle', 'Enter Title')} register={register} key="title" errors={errors} control={control} />
						</div>
						<div className="lg:col-span-2 grid lg:grid-cols-3 gap-6">
							<FormInput type="bottom-sheet" label={t('Manage.Appointments.Add_LocationType', 'Location Type')} name="locationType" containerClass="form-field" labelClassName="form-label" className="form-select" register={register} key="locationType" errors={errors} control={control}>
								<option value="">{t('Manage.Appointments.Add.DD_SelectLocation', 'Select Location')}</option>
								{Object.values(AppointmentLocationType).map((loc) => (
									<option key={loc} value={loc}>
										{loc}
									</option>
								))}
							</FormInput>

							<FormInput type="bottom-sheet" label={t('Manage.Appointments.Add_Duration', 'Duration')} name="durationMinutes" labelClassName="form-label" containerClass="form-field" className="form-select" register={register} key="durationMinutes" errors={errors} control={control}>
								<option value="">{t('Manage.Appointments.Add.DD_SelectDuration', 'Select Duration')}</option>
								<option value="30">{t('Manage.Appointments.Duration_30Minutes', '30 Minutes')}</option>
								<option value="60">{t('Manage.Appointments.Duration_1Hour', '1 Hour')}</option>
								<option value="90">{t('Manage.Appointments.Duration_1_30Hours', '1.30 Hours')}</option>
								<option value="120">{t('Manage.Appointments.Duration_2Hours', '2 Hours')}</option>
							</FormInput>

							<FormInput type="bottom-sheet" label={t('Manage.Appointments.Add_AppointmentApproval', 'Appointment Approval')} name="approvalRule" labelClassName="form-label" containerClass="form-field" className="form-select" register={register} key="approvalRule" errors={errors} control={control} onChange={(e: any) => setSelectedApprovalRule(e.target.value)}>
								<option value="">{t('Manage.Appointments.Add.DD_SelectApproval', 'Select Approval')}</option>

								{Object.values(AppointmentApprovalRule).map((loc) => (
									<option key={loc} value={loc}>
										{formatHelper.punctuateLabel(loc)}
									</option>
								))}
							</FormInput>
						</div>
						{showMultipleParticipantField && (
							<div className="lg:col-span-2">
								<FormInput type="number" label={t('Manage.Appointments.Add_LabelMultipleParticipantPerSlot', 'Multiple Participant Per Slot')} labelClassName="form-label" containerClass="form-field" name="multipleParticipantPerSlot" className="form-input" placeholder={t('Manage.Appointments.Add.Placeholder_EnterParticipantsPerSlot', 'Enter number of participants per slot')} register={register} key="multipleParticipantPerSlot" errors={errors} control={control} />
							</div>
						)}
						<div className="lg:col-span-2">
							<AppointmentTime
								hideAddButton={showAddParticipantWindow}
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
							<ParticipantWithTimeZone label={t('Manage.Appointments.Add_InviteRequired', 'Required Participants')} onChange={(list) => setModalKey('required', list)} value={modalState.required} excludedParticipants={modalState.optional} />
						</div>
						<div className="lg:col-span-2">
							<ParticipantWithTimeZone label={t('Manage.Appointments.Add_InviteOptional', 'Optional Participants')} onChange={(list) => setModalKey('optional', list)} value={modalState.optional} excludedParticipants={modalState.required} />
						</div>
						<div className="lg:col-span-2">
							<FormInput type="textarea" label={t('Manage.Appointments.Add_Description', 'Description')} labelClassName="form-label" containerClass="form-field" name="Description" className="form-input" placeholder={t('Manage.Appointments.Add.Placeholder_EnterDescription', 'Enter Description')} register={register} key="Description" errors={errors} control={control} />
						</div>
					</div>
				</PopupBody>

				<PopupFooter>
					<button className="btn btn-secondary" onClick={() => addNewAppointmentOutPut(false)} type="button">
						{t('Manage.Appointments.Add_Close', 'Close')}
					</button>
					<button className="btn btn-primary" type="submit">
						{t('Manage.Appointments.Add_SaveChanges', 'Save Changes')}
					</button>
				</PopupFooter>
			</form>
		</PopupWrapper>
	)
}

export default AddAppointmentEvent
