import { useForm } from 'react-hook-form'
import FormInput from '@/components/FormInput'
import { PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import { ParticipantCancelRequest } from '@/helpers/api/WebApiClient'
import { participantRequestService } from '@/services/ParticipantRequestService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { useTranslation } from 'react-i18next'

interface FormValues {
	cancelReason: string
}

interface ParticipantCancelAppointmentEventProps {
	urlIdentifier: string
	cancelAppointmentOutPut: (isAdded: boolean) => void
}

const ParticipantCancelAppointmentEvent = (props: ParticipantCancelAppointmentEventProps) => {
	const { t } = useTranslation()
	const methods = useForm<FormValues>({})
	const {
		handleSubmit,
		register,
		control,
		formState: { errors },
	} = methods
	const onSubmitEvent = async (formValues: FormValues) => {
		const { cancelReason } = formValues

		if (!cancelReason || cancelReason.trim() === '') {
			messageHelper.showError('Please enter a cancellation reason.')
			return
		}

		const payload = new ParticipantCancelRequest({
			urlIdentifier: props.urlIdentifier,
			reason: String(cancelReason),
		})

		await runWithToast(() => participantRequestService.participantCancel(payload), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.cancelAppointmentOutPut(true)
			},
		})
	}

	return (
		<PopupWrapper variant="appointment">
			<PopupHeader title={t('Manage.Participants.Cancel_Title', 'Cancel Appointment')} onClose={() => props.cancelAppointmentOutPut(false)} />
			<form onSubmit={handleSubmit(onSubmitEvent)}>
				<PopupBody className="py-6 px-6">
					<div className="flex-col">
						<div className="w-full">
							<FormInput type="textarea" label={t('Manage.Participants.Cancel_LabelReason', 'Cancel Reason')} labelClassName="form-label-auth" name="cancelReason" className="form-textarea-tall" placeholder={t('Manage.Participants.Cancel.Placeholder_EnterReason', 'Enter cancellation reason')} containerClass="form-field-appointment" register={register} key="cancelReason" errors={errors} control={control} />
						</div>
					</div>
				</PopupBody>

				<PopupFooter>
					<button className="btn btn-secondary" onClick={() => props.cancelAppointmentOutPut(false)} type="button">
						{t('Common.Close', 'Close')}
					</button>
					<button className="btn btn-danger" type="submit">
						{t('Manage.Participants.Cancel_Button', 'Cancel Appointment')}
					</button>
				</PopupFooter>
			</form>
		</PopupWrapper>
	)
}

export default ParticipantCancelAppointmentEvent
