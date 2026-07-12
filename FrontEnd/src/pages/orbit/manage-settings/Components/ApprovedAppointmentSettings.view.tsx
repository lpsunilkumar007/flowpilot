import { ApprovedAppointmentSetting, MailDto } from '@/helpers/api/WebApiClient'
import React from 'react'
import { FormInput, Label, PageBreadcrumbsWithLinks } from '@/components'
import ReactQuill from 'react-quill-new'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import SettingsTabs from './SettingsTabs'
import type { TFunction } from 'i18next'

export interface MailDtoValidation {
	[key: string]: MailDtoErrors
}

export interface MailDtoErrors {
	from?: string
	displayName?: string
	subject?: string
	body?: string
	replyTo?: string
	cc?: string
	bcc?: string
}

const modules = {
	toolbar: [[{ font: [] }, { size: [] }], ['bold', 'italic', 'underline', 'strike'], [{ color: [] }, { background: [] }], [{ script: 'super' }, { script: 'sub' }], [{ header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'], [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }], ['direction', { align: [] }], ['link', 'image', 'video'], ['clean']],
}

type Props = {
	id?: string
	data?: ApprovedAppointmentSetting
	validationErrors: MailDtoValidation
	userHasPermission: (p: PermissionTypes) => boolean
	t: TFunction

	handleSave: () => void
	handleChange: (path: string[], value: any) => void
	handleReminderBeforeDaysChange: (value: number) => void
	handleLastReminderBeforeMinuteChange: (value: number) => void
}

const ApprovedAppointmentSettingsView: React.FC<Props> = ({ data, validationErrors, userHasPermission, t, handleSave, handleChange, handleReminderBeforeDaysChange, handleLastReminderBeforeMinuteChange }) => {
	function renderApprovedAppointmentReminderSetting(reminderBeforeDays: number | undefined, lastReminderBeforeHours: number | undefined) {
		return (
			<div className="card rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center">
					<h3 className="text-lg font-semibold orbit-body">{t('Manage.Approved.Appointment.Tab_ApprovedAppointmentHeading', 'Approved Appointment Settings')}</h3>
				</div>

				<div className="p-6">
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-1.5">
								<Label variant="section-alt">{t('Manage.Approved.Appointment.Tab_ReminderBeforeDays', 'Reminder Before Days')}</Label>
								<FormInput type="number" defaultValue={reminderBeforeDays ?? ''} onChange={(e) => handleReminderBeforeDaysChange(Number(e.target.value))} placeholder={t('Manage.Approved.Appointment.Tab.Placeholder_EnterReminderDays', 'Enter Reminder Days')} className="w-full form-control form-input" name="reminderBeforeDays" />
							</div>

							<div className="space-y-1.5">
								<Label variant="section-alt">{t('Manage.Approved.Appointment.Tab_LastReminderBeforeHours', 'Last Reminder Before Hours')}</Label>
								<FormInput type="number" defaultValue={lastReminderBeforeHours ?? ''} onChange={(e) => handleLastReminderBeforeMinuteChange(Number(e.target.value))} placeholder={t('Manage.Approved.Appointment.Tab.Placeholder_EnterHours', 'Enter Hours')} className="w-full form-control form-input" name="lastReminderBeforeHours" />
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end items-center gap-2 p-5 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-b-xl">
					{userHasPermission(PermissionTypes.Permissions_ManageSettings_Update) && (
						<button className="btn btn-primary hover:bg-primary/90 transition" onClick={handleSave}>
							{t('Manage.Approved.Appointment.Tab_Update', 'Update')}
						</button>
					)}
				</div>
			</div>
		)
	}

	function renderMailDto(model: MailDto, path: string) {
		if (!model) return null
		return (
			<div className="card">
				<div key={path} className="space-y-4">
					<div className="grid lg:grid-cols-1 px-6 py-6 gap-6 pt-5">
						<div className="space-y-1">
							<Label variant="field">
								{t('Manage.Approved.Appointment.Tab_Subject', 'Subject')} <span className="required-asterisk">*</span>
							</Label>
							<input className="form-control form-input" type="text" value={model.subject || ''} onChange={(e) => handleChange([path, 'subject'], e.target.value)} />
							{validationErrors[path]?.subject && <p className="orbit-field-error">{validationErrors[path].subject}</p>}
						</div>

						<div className="space-y-1 ql-editor-style1">
							<Label variant="field">
								{t('Manage.Approved.Appointment.Tab_Body', 'Body')} <span className="required-asterisk">*</span>
							</Label>
							<ReactQuill modules={modules} value={model.body || ''} theme="snow" onChange={(value) => handleChange([path, 'body'], value)} />
							{validationErrors[path]?.body && <p className="orbit-field-error">{validationErrors[path].body}</p>}
						</div>
					</div>

					<div className="settings-footer">
						{userHasPermission(PermissionTypes.Permissions_ManageSettings_Update) && (
							<button className="btn btn-primary float-right" onClick={handleSave}>
								{t('Manage.Approved.Appointment.AllTab_Update', 'Update')}
							</button>
						)}
					</div>
				</div>
			</div>
		)
	}

	const renderAppointmentSettingDetails = (settingDetail: ApprovedAppointmentSetting) => {
		const tabContents = [
			{
				title: t('Manage.Approved.Appointment.Tab_ApprovedAppointment', 'Approved Appointment'),
				content: renderApprovedAppointmentReminderSetting(settingDetail.reminderBeforeDays, settingDetail.lastReminderBeforeMinute),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_AppointmentConfirmed', 'Appointment Confirmed'),
				content: renderMailDto(settingDetail.appointmentConfirmedEmailForHost ?? new MailDto(), 'appointmentConfirmedEmailForHost'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_AppointmentDeclined', 'Appointment Declined'),
				content: renderMailDto(settingDetail.appointmentDeclinedEmailForHost ?? new MailDto(), 'appointmentDeclinedEmailForHost'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_AppointmentConfirmedForParticipant', 'Appointment Confirmed For Participant'),
				content: renderMailDto(settingDetail.appointmentConfirmedEmailForParticipant ?? new MailDto(), 'appointmentConfirmedEmailForParticipant'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_AppointmentDeclinedForParticipant', 'Appointment Declined For Participant'),
				content: renderMailDto(settingDetail.appointmentDeclinedEmailForParticipant ?? new MailDto(), 'appointmentDeclinedEmailForParticipant'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_AppointmentConfirmedRemainderEmailForParticipant', 'Appointment Confirmed Reminder Email For Participant'),
				content: renderMailDto(settingDetail.confirmedReminderEmailForParticipants ?? new MailDto(), 'confirmedReminderEmailForParticipants'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_ConfirmedRemainderEmailForHost', 'Confirmed Reminder Email For Host'),
				content: renderMailDto(settingDetail.confirmedReminderEmailForHost ?? new MailDto(), 'confirmedReminderEmailForHost'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_JitsiConfirmedReminderEmailForHost', 'Jitsi Confirmed Reminder Email For Host'),
				content: renderMailDto(settingDetail.jitsiConfirmedReminderEmailForHost ?? new MailDto(), 'jitsiConfirmedReminderEmailForHost'),
			},
			{
				title: t('Manage.Approved.Appointment.Tab_JitsiConfirmedReminderEmailForParticipants', 'Jitsi Confirmed Reminder Email For Participants'),
				content: renderMailDto(settingDetail.jitsiConfirmedReminderEmailForParticipants ?? new MailDto(), 'jitsiConfirmedReminderEmailForParticipants'),
			},
		]

		return <SettingsTabs tabContent={tabContents} />
	}

	return (
		<div>
			<PageBreadcrumbsWithLinks
				title={t('Manage.Approved.Appointment.Heading', 'Approved Appointment Settings')}
				subNames={[
					{ label: t('Manage.Approved.Appointment.Administrator_Subtitle', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu },
					{ label: t('Manage.Approved.Appointment.Settings_Subtitle', 'Settings'), link: MenuLinks.ManageSettings },
					{ label: t('Manage.Approved.Appointment.Breadcrumb', 'Approved Appointments') },
				]}
			/>
			{data && (
				<div className="shadow-sm rounded-none mt-2 h-full">
					<p className="orbit-body-emphasis">{renderAppointmentSettingDetails(data)}</p>
				</div>
			)}
		</div>
	)
}

export default ApprovedAppointmentSettingsView

