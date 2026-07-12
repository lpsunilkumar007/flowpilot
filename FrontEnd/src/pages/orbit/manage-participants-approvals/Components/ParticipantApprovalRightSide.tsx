import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { ViewParticipantAppointmentAvailabilityWindowResponse, ViewParticipantAppointmentAvailabilityBookedWindowResponse, ViewParticipantAppointmentRequestResponse, AppointmentApprovalRule } from '@/helpers/api/WebApiClient'
import { formatHelper } from '@/helpers/format.helper'
import Tippy from '@tippyjs/react'

interface TimeSlot {
	timeFrom: moment.Moment
	timeTo: moment.Moment
	onDate: moment.Moment
}

interface GroupedSlots {
	[dateKey: string]: TimeSlot[]
}

interface ParticipantApprovalRightSideProps {
	appointmentData: ViewParticipantAppointmentRequestResponse
	onSelectionChange?: (selectedDate: moment.Moment | null, selectedTimeSlot: TimeSlot | null) => void
}

type ModalState = {
	selectedDate: moment.Moment | null
	selectedTimeSlot: TimeSlot | null
	availableDates: moment.Moment[] | null
	generatedTimeSlots: moment.Moment[] | null
}

const ParticipantApprovalRightSide: React.FC<ParticipantApprovalRightSideProps> = ({ appointmentData, onSelectionChange }) => {
	const { t } = useTranslation()
	const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({})

	const [modalState, setModalState] = useState<ModalState>({
		selectedDate: null,
		selectedTimeSlot: null,
		availableDates: null,
		generatedTimeSlots: null,
	})
	const assignValueToModal = (key: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	const isDateInPast = (date: moment.Moment): boolean => {
		const today = moment().startOf('day')
		return date.isBefore(today)
	}

	const isTimeSlotInPast = (time: moment.Moment, date: moment.Moment): boolean => {
		const now = moment()
		const slotDateTime = date.clone().set({
			hour: time.hour(),
			minute: time.minute(),
			second: 0,
			millisecond: 0,
		})
		return slotDateTime.isBefore(now)
	}

	const isTimeSlotBooked = (time: moment.Moment, date: moment.Moment): boolean => {
		if (!appointmentData?.bookedWindow?.length) return false

		const slotDateKey = formatHelper.MomentDateKey(date)
		const slotTimeKey = formatHelper.MomentTimeKey(time)

		const bookedSlot = appointmentData.bookedWindow.find((booked: ViewParticipantAppointmentAvailabilityBookedWindowResponse) => {
			const bookedDateKey = formatHelper.MomentDateKey(moment(booked.approveForDate))
			const bookedTimeKey = formatHelper.MomentTimeKey(moment(booked.approveTimeFrom))
			return bookedDateKey === slotDateKey && bookedTimeKey === slotTimeKey
		})

		if (!bookedSlot) return false

		const maxParticipants = appointmentData.multipleParticipantPerSlot || 1
		return bookedSlot.bookedCount >= maxParticipants
	}

	const getSlotBookingInfo = (time: moment.Moment, date: moment.Moment): { booked: number; total: number; tooltipText: string } => {
		const maxParticipants = appointmentData.multipleParticipantPerSlot || 1

		if (!appointmentData?.bookedWindow?.length) {
			return { booked: 0, total: maxParticipants, tooltipText: `0/${maxParticipants} Pending` }
		}

		const slotDateKey = formatHelper.MomentDateKey(date)
		const slotTimeKey = formatHelper.MomentTimeKey(time)

		const bookedSlot = appointmentData.bookedWindow.find((booked: ViewParticipantAppointmentAvailabilityBookedWindowResponse) => {
			const bookedDateKey = formatHelper.MomentDateKey(moment(booked.approveForDate))
			const bookedTimeKey = formatHelper.MomentTimeKey(moment(booked.approveTimeFrom))
			return bookedDateKey === slotDateKey && bookedTimeKey === slotTimeKey
		})

		if (!bookedSlot) {
			return { booked: 0, total: maxParticipants, tooltipText: `0/${maxParticipants} Pending` }
		}

		const bookedCount = bookedSlot.bookedCount

		if (bookedCount >= maxParticipants) {
			return { booked: bookedCount, total: maxParticipants, tooltipText: '' }
		} else {
			return { booked: bookedCount, total: maxParticipants, tooltipText: `${bookedCount}/${maxParticipants} Pending` }
		}
	}

	const generateTimeSlots = (timeFrom: moment.Moment, timeTo: moment.Moment, duration: number): moment.Moment[] => {
		const slots: moment.Moment[] = []
		let current = timeFrom.clone()

		while (current.isBefore(timeTo)) {
			slots.push(current.clone())
			current.add(duration, 'minutes')
		}

		return slots
	}

	useEffect(() => {
		if (!appointmentData?.availabilityWindow?.length) return

		const grouped: GroupedSlots = {}
		const dates: moment.Moment[] = []

		appointmentData.availabilityWindow.forEach((window: ViewParticipantAppointmentAvailabilityWindowResponse) => {
			const dateKey = moment(window.onDate).format('YYYY-MM-DD')
			const dateMoment = moment(window.onDate).startOf('day')

			if (!grouped[dateKey]) {
				grouped[dateKey] = []
				dates.push(dateMoment)
			}

			grouped[dateKey].push({
				timeFrom: moment(window.timeFrom),
				timeTo: moment(window.timeTo),
				onDate: moment(window.onDate),
			})
		})

		dates.sort((a, b) => a.valueOf() - b.valueOf())

		Object.keys(grouped).forEach((key) => {
			grouped[key].sort((a, b) => a.timeFrom.valueOf() - b.timeFrom.valueOf())
		})

		setGroupedSlots(grouped)
		assignValueToModal('availableDates', dates)

		const firstValid = dates.find((d) => !isDateInPast(d)) || dates[0]
		assignValueToModal('selectedDate', firstValid)
	}, [appointmentData])

	useEffect(() => {
		if (!modalState.selectedDate) return

		const dateKey = modalState.selectedDate.format('YYYY-MM-DD')
		const windows = groupedSlots[dateKey] || []

		if (!windows.length || !appointmentData.durationMinutes) {
			assignValueToModal('generatedTimeSlots', [])
			assignValueToModal('selectedTimeSlot', null)
			return
		}

		const { timeFrom, timeTo } = windows[0]
		const slots = generateTimeSlots(timeFrom, timeTo, appointmentData.durationMinutes)

		assignValueToModal('generatedTimeSlots', slots)
		assignValueToModal('selectedTimeSlot', null)
	}, [modalState.selectedDate, groupedSlots, appointmentData])

	useEffect(() => {
		if (onSelectionChange) {
			onSelectionChange(modalState.selectedDate, modalState.selectedTimeSlot)
		}
	}, [modalState.selectedDate, modalState.selectedTimeSlot])

	return (
		<div className="card p-6 sm:p-10 flex flex-col h-full w-full border-b lg:border-r border-gray-200">
			<div className="flex items-start justify-between mb-6 flex-wrap gap-3">
				<div>
					<p className="text-xs orbit-muted mb-1 font-extrabold uppercase tracking-wide">{t('Manage.Participants.Approval_AvailableDate', 'Available Date')}</p>
					{modalState.selectedDate && <p className="text-xl font-bold orbit-heading">{modalState.selectedDate.format('dddd, MMMM D')}</p>}
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
				<div className="space-y-2">
					{modalState.availableDates && modalState.availableDates.length === 0 ? (
						<p className="orbit-muted text-center py-8">{t('Manage.Participants.Approval_NoAvailableDates', 'No available dates')}</p>
					) : (
						modalState.availableDates &&
						modalState.availableDates.map((date, index) => {
							const isSelected = modalState.selectedDate?.isSame(date, 'day')
							const isPast = isDateInPast(date)

							return (
								<button
									key={index}
									disabled={isPast}
									onClick={() => !isPast && assignValueToModal('selectedDate', date)}
									className={`w-full px-3 py-3 rounded-lg font-semibold transition-all shadow-sm 
										${isPast ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60' : isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}
								>
									<div className="flex items-center gap-2 justify-center">
										<span
											className={`w-2 h-2 rounded-full 
												${isSelected ? 'bg-white' : isPast ? 'bg-gray-400' : 'bg-green-500'}`}
										></span>
										<span>{date.format('ddd, MMM D')}</span>
									</div>
								</button>
							)
						})
					)}
				</div>

				<div className="space-y-2">
					{modalState.generatedTimeSlots && modalState.generatedTimeSlots.length === 0 ? (
						<p className="orbit-muted text-center py-8 col-span-2">{t('Manage.Participants.Approval_NoAvailableTimeSlots', 'No available time slots')}</p>
					) : (
						modalState.generatedTimeSlots &&
						modalState.generatedTimeSlots.map((time, index) => {
							const timeTo = time.clone().add(appointmentData.durationMinutes, 'minutes')
							const timeRange = `${time.format('h:mm A')}-${timeTo.format('h:mm A')}`
							const isSelected = modalState.selectedTimeSlot?.timeFrom?.isSame(time)
							const isPast = modalState.selectedDate ? isTimeSlotInPast(time, modalState.selectedDate) : false
							const isBooked = modalState.selectedDate ? isTimeSlotBooked(time, modalState.selectedDate) : false
							const isDisabled = isPast || isBooked
							const bookingInfo = appointmentData.approvalRule === AppointmentApprovalRule.CreateAppointmentForTheParticipantOnceApprovedByThatParticipantMultiplePerSlot ? (modalState.selectedDate ? getSlotBookingInfo(time, modalState.selectedDate) : { booked: 0, total: 1, tooltipText: '' }) : null

							return (
								<button
									key={index}
									disabled={isDisabled}
									onClick={() =>
										!isDisabled &&
										assignValueToModal('selectedTimeSlot', {
											timeFrom: time,
											timeTo: timeTo,
											onDate: modalState.selectedDate!,
										})
									}
									className={`w-full px-3 py-3 rounded-lg font-semibold transition-all shadow-sm flex items-center
									${bookingInfo?.tooltipText ? 'justify-between' : 'justify-center'}
									${isDisabled ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60' : isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 hover:shadow-md'}`}
								>
									<span>{timeRange}</span>

									{bookingInfo && bookingInfo.tooltipText && (
										<Tippy content={bookingInfo.tooltipText} animation="scale-subtle" duration={0} className="bg-black text-white m-2 p-2 rounded" arrow={false}>
											<i className="ri-information-fill text-xl font-bold cursor-pointer"></i>
										</Tippy>
									)}
								</button>
							)
						})
					)}
				</div>
			</div>

			{modalState.selectedDate && modalState.selectedTimeSlot && (
				<p className="text-sm orbit-body-emphasis mt-4">
					Selected:{' '}
					<span className="orbit-link font-medium">
						{modalState.selectedDate.format('ddd, MMM D')} {modalState.selectedTimeSlot.timeFrom.format('h:mm A')}-{modalState.selectedTimeSlot.timeTo.format('h:mm A')}
					</span>
				</p>
			)}
		</div>
	)
}

export default ParticipantApprovalRightSide
