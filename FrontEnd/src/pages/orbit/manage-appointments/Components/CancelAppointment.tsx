import { useForm } from 'react-hook-form'
import FormInput from '@/components/FormInput'
import { PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import { CancelAppointmentRequest } from '@/helpers/api/WebApiClient'
import { appointmentRequestService } from '@/services/AppointmentRequestService'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { useTranslation } from 'react-i18next'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'

interface FormValues {
	cancelReason: string
}

interface CancelAppointmentEventProps {
	id: number
	cancelAppointmentOutPut: (isAdded: boolean) => void
}

const CancelAppointmentEvent = (props: CancelAppointmentEventProps) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
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

		if (!props.id) {
			messageHelper.showError('Appointment ID is missing.')
			return
		}

		const payload = new CancelAppointmentRequest({
			fkTempAppointmentsPKId: props.id,
			cancellationReason: String(cancelReason),
		})

		await runWithToast(() => appointmentRequestService.cancelAppointment(payload), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				props.cancelAppointmentOutPut(true)
			},
		})
	}

	return (
		<PopupWrapper variant="appointment">
			<PopupHeader title={t('Manage.Appointment.Cancel_Heading', 'Cancel Appointment')} onClose={() => props.cancelAppointmentOutPut(false)} />
			<form onSubmit={handleSubmit(onSubmitEvent)}>
				<PopupBody className="py-6 px-6">
					<div className="flex-col">
						<div className="w-full">
							<FormInput type="textarea" label={t('Manage.Appointment.Cancel_CancelReason', 'Cancellation Reason')} labelClassName="form-label-auth" name="cancelReason" className="form-textarea-tall" placeholder={t('Manage.Appointment.Cancel.Placeholder_CancelReason', 'Enter cancellation reason')} containerClass="form-field-appointment" register={register} key="cancelReason" errors={errors} control={control} />
						</div>
					</div>
				</PopupBody>

				<PopupFooter>
					<button className="btn btn-secondary" onClick={() => props.cancelAppointmentOutPut(false)} type="button">
						{t('Manage.Appointment.Cancel_Close', 'Close')}
					</button>
					{userHasPermission(PermissionTypes.Permissions_ManageAppointments_Update) && (
						<button className="btn btn-danger" type="submit">
							{t('Manage.Appointment.Cancel_CancelAppointment', 'Cancel Appointment')}
						</button>
					)}
				</PopupFooter>
			</form>
		</PopupWrapper>
	)
}

export default CancelAppointmentEvent
