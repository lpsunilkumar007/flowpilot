import { AppointmentColorSetting, AppointmentSettingModels, MailDto } from '@/helpers/api/WebApiClient'
import React from 'react'
import { FormInput, Label, PageBreadcrumbsWithLinks } from '@/components'
import ReactQuill from 'react-quill-new'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { formatHelper } from '@/helpers/format.helper'
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
	data?: AppointmentSettingModels
	validationErrors: MailDtoValidation
	userHasPermission: (p: PermissionTypes) => boolean
	t: TFunction

	handleSave: () => void
	handleChange: (path: string[], value: any) => void
	handleReminderDaysChange: (index: number, value: number) => void
	handleAddMore: () => void
	handleDelete: (index: number) => void
	handleIncludeFinalReminderChange: (value: boolean) => void
	handleAutoAppointmentCancelEnabledChange: (value: boolean) => void
	handleColorSettingChange: (index: number, field: 'appointmentStatus' | 'backgroundColor', value: any) => void
}

const AppointmentSettingsView: React.FC<Props> = ({ data, validationErrors, userHasPermission, t, handleSave, handleChange, handleReminderDaysChange, handleAddMore, handleDelete, handleIncludeFinalReminderChange, handleAutoAppointmentCancelEnabledChange, handleColorSettingChange }) => {
	function renderAppointmentReminderEmailSetting(reminderAfterDays: number[], includeFinalReminderBeforeAppointment: boolean, isAutoAppointmentCancelEnabled: boolean, appointmentColorSetting: AppointmentColorSetting[]) {
		const reminderDays = reminderAfterDays && reminderAfterDays.length > 0 ? reminderAfterDays : [0]

		return (
			<div className="card rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center">
					<h3 className="text-lg font-semibold orbit-body">{t('Manage.Appointment.Settings.Tab.AppointmentSettings_Heading', 'Appointment Settings')}</h3>
				</div>

				<div className="p-6">
					<div className="grid grid-cols-12 gap-4 font-semibold orbit-label-secondary mb-3">
						<div className="col-span-5">{t('Manage.Appointment.Settings.Tab_RemainderDays', 'Remainder Days')}</div>
						<div className="col-span-2 text-center">{t('Manage.Appointment.Settings.Tab_Action', 'Action')}</div>
					</div>

					<div className="space-y-3">
						{reminderDays.map((day, index) => (
							<div key={index} className="grid grid-cols-12 gap-4 items-center px-3 py-2">
								<div className="col-span-5">
									<FormInput type="number" defaultValue={day} onChange={(e) => handleReminderDaysChange(index, Number(e.target.value))} placeholder={t('Manage.Appointment.Settings.Tab.Placeholder_EnterRemainingDays', 'Enter Remaining Days')} className="w-full form-control form-input" name={`reminder-${index}`} />
								</div>

								<div className="col-span-2 flex justify-center">
									<button type="button" className="orbit-danger-text orbit-danger-hover flex items-center space-x-1" onClick={() => handleDelete(index)}>
										<i className="ri-delete-bin-2-fill orbit-danger-text"></i>
										<span className="hidden sm:inline">{t('Manage.Appointment.Settings.Tab_Remove', 'Remove')}</span>
									</button>
								</div>
							</div>
						))}
						<div className="flex justify-end mt-5">
							<button type="button" className="btn btn-primary hover:bg-primary/90 transition" onClick={handleAddMore}>
								<i className="ri-add-line mr-1"></i> {t('Manage.Appointment.Settings.Tab_AddMore', 'Add More')}
							</button>
						</div>
						<FormInput label={t('Manage.Appointment.Settings.Tab_IncludeFinalRemainder', 'Include Final Reminder')} checked={includeFinalReminderBeforeAppointment} onChange={(e) => handleIncludeFinalReminderChange(e.target.checked)} type="checkbox" name="includeFinalReminderBeforeAppointment" key="includeFinalReminderBeforeAppointment" />
						<FormInput label={t('Manage.Appointment.Settings.Tab_IsAutoAppointment', 'Auto Cancel Appointment')} checked={isAutoAppointmentCancelEnabled} onChange={(e) => handleAutoAppointmentCancelEnabledChange(e.target.checked)} type="checkbox" name="isAutoAppointmentCancelEnabled" key="isAutoAppointmentCancelEnabled" />

						<div className="mt-6">
							<div className="font-semibold orbit-label-secondary mb-3">{t('Manage.Appointment.Settings.Tab_AppointmetColor', 'Appointment Color')}</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{(appointmentColorSetting || []).map((item, idx) => (
									<div key={idx} className="grid grid-cols-12 gap-4 items-center px-3 py-2">
										<div className="col-span-5">
											<input type="text" className="form-control form-input w-full" value={formatHelper.punctuateLabel(item.appointmentStatus || '')} readOnly />
										</div>
										<div className="col-span-4">
											<input type="color" className="form-control form-input w-24 h-10 p-1" value={item.backgroundColor || '#ffffff'} onChange={(e) => handleColorSettingChange(idx, 'backgroundColor', e.target.value)} />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end items-center gap-2 p-5 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-b-xl">
					{userHasPermission(PermissionTypes.Permissions_ManageSettings_Update) && (
						<button className="btn btn-primary hover:bg-primary/90 transition" onClick={handleSave}>
							{t('Manage.Appointment.Settings.Tab_Update', 'Update')}
						</button>
					)}
				</div>
			</div>
		)
	}

	function renderMailDto(model: MailDto, path: string) {
		if (!model) return null
		return (
			<div className="card overflow-hidden w-full">
				<div key={path} className="w-full max-w-full space-y-6">
					{/* Content */}
					<div className="grid grid-cols-1 px-4 sm:px-6 py-6 gap-6">
						{/* Subject */}
						<div className="space-y-1 min-w-0">
							<Label variant="field">
								{t('Manage.Appointment.Settings.Tab_Subject', 'Subject')}
								<span className="required-asterisk">*</span>
							</Label>

							<input className="form-control form-input w-full" type="text" value={model.subject || ''} onChange={(e) => handleChange([path, 'subject'], e.target.value)} />

							{validationErrors[path]?.subject && <p className="orbit-field-error">{validationErrors[path].subject}</p>}
						</div>

						{/* Body */}
						<div className="space-y-1 min-w-0 ql-editor-style1">
							<Label variant="field">
								{t('Manage.Appointment.Settings.Tab_Body', 'Body')}
								<span className="required-asterisk">*</span>
							</Label>

							<div className="w-full max-w-full overflow-hidden">
								<ReactQuill modules={modules} value={model.body || ''} theme="snow" onChange={(value) => handleChange([path, 'body'], value)} />
							</div>

							{validationErrors[path]?.body && <p className="orbit-field-error">{validationErrors[path].body}</p>}
						</div>
					</div>

					{/* Footer */}
					<div className="settings-footer px-4 sm:px-6 pb-6 flex justify-end">
						{userHasPermission(PermissionTypes.Permissions_ManageSettings_Update) && (
							<button className="btn btn-primary w-full sm:w-auto" onClick={handleSave}>
								{t('Manage.Appointment.Settings.Tab2_Update', 'Update')}
							</button>
						)}
					</div>
				</div>
			</div>
		)
	}

	const renderAppointmentSettingDetails = (settingDetail: AppointmentSettingModels) => {
		const tabContents = [
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentCreateSetting', 'Appointment Settings'),
				content: renderAppointmentReminderEmailSetting(settingDetail.reminderAfterDays ?? [], settingDetail.includeFinalReminderBeforeAppointment ?? false, settingDetail.isAutoAppointmentCancelEnabled ?? false, settingDetail.appointmentColorSetting ?? []),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentCreateEmail', 'Appointment Created Email'),
				content: renderMailDto(settingDetail.appointmentCreatedEmail ?? new MailDto(), 'appointmentCreatedEmail'),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentCreateReminderEmail', 'Appointment Reminder Email'),
				content: renderMailDto(settingDetail.appointmentCreatedReminderEmail ?? new MailDto(), 'appointmentCreatedReminderEmail'),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentCancelledEmailForAttendee', 'Appointment Cancelled Email For Attendee'),
				content: renderMailDto(settingDetail.appointmentCancelledEmailForAttendee ?? new MailDto(), 'appointmentCancelledEmailForAttendee'),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentCancelledEmailForHost', 'Appointment Cancelled Email For Host'),
				content: renderMailDto(settingDetail.appointmentCancelledEmailForHost ?? new MailDto(), 'appointmentCancelledEmailForHost'),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentSystemCancelledEmailForAttendee', 'Appointment System Cancelled Email For Attendee'),
				content: renderMailDto(settingDetail.appointmentSystemCancelledEmailForAttendee ?? new MailDto(), 'appointmentSystemCancelledEmailForAttendee'),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentSystemCancelledEmailForHost', 'Appointment System Cancelled Email For Host'),
				content: renderMailDto(settingDetail.appointmentSystemCancelledEmailForHost ?? new MailDto(), 'appointmentSystemCancelledEmailForHost'),
			},
			{
				title: t('Manage.Appointment.Settings.Tab_AppointmentRescheduledEmail', 'Appointment Rescheduled Email'),
				content: renderMailDto(settingDetail.appointmentRescheduledEmail ?? new MailDto(), 'appointmentRescheduledEmail'),
			},
		]

		return <SettingsTabs tabContent={tabContents} />
	}

	return (
		<div>
			<PageBreadcrumbsWithLinks title={t('Manage.Appointment.Settings_Heading', 'Appointment Settings')} subNames={[{ label: t('Manage.Appointment.Settings.Administrator_Subtitle', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Appointment.Settings.Settings_Subtitle', 'Settings'), link: MenuLinks.ManageSettings }, { label: t('Manage.Appointment.Settings_Breadcrumb', 'Appointment Settings') }]} />
			{data && (
				<div className="shadow-sm rounded-none mt-2 h-full">
					<p className="orbit-body-emphasis">{renderAppointmentSettingDetails(data)}</p>
				</div>
			)}
		</div>
	)
}

export default AppointmentSettingsView
