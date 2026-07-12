import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components'

interface AppointmentTimeProps {
	value?: any[]
	onChange: (list: any[]) => void
	hideAddButton?: boolean
}

const allowedMinutes = ['00', '15', '30', '45']
const hours12 = Array.from({ length: 12 }, (_, i) => i + 1)
const ampmOptions = ['AM', 'PM']

const getCurrentTime = () => {
	const now = new Date()
	const hours = now.getHours()
	const minutes = now.getMinutes()

	const nearestMinute = [0, 15, 30, 45].reduce((prev, curr) => (Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev))

	const ampm = hours >= 12 ? 'PM' : 'AM'
	let displayHour = hours
	if (displayHour === 0) displayHour = 12
	if (displayHour > 12) displayHour -= 12

	return {
		hour: displayHour,
		minute: String(nearestMinute).padStart(2, '0'),
		ampm,
		formatted: `${String(hours).padStart(2, '0')}:${String(nearestMinute).padStart(2, '0')}`,
	}
}


const getTomorrow = () => {
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	return tomorrow.toISOString().split('T')[0]
}
interface TimePickerProps {
	value: string
	onChange: (time: string) => void
	field: 'fromTime' | 'toTime'
	name?: string
}

const TimePicker = ({ value, onChange }: TimePickerProps) => {
	const { t } = useTranslation()
	const [isOpen, setIsOpen] = useState(false)
	const [selectedHour, setSelectedHour] = useState(12)
	const [selectedMinute, setSelectedMinute] = useState('15')
	const [selectedAmpm, setSelectedAmpm] = useState('AM')
	const previousValueRef = useRef<string | null>(null)
	const isInitializedRef = useRef(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (value && value.includes(':') && value !== previousValueRef.current) {
			// eslint-disable-next-line prefer-const
			let [h, m] = value.split(':').map(Number)
			const ampm = h >= 12 ? 'PM' : 'AM'
			if (h === 0) h = 12
			if (h > 12) h -= 12
			const minuteStr = String(m).padStart(2, '0')
			const validatedMinute = allowedMinutes.includes(minuteStr) ? minuteStr : '15'

			setSelectedHour(h)
			setSelectedMinute(validatedMinute)
			setSelectedAmpm(ampm)
			previousValueRef.current = value
			isInitializedRef.current = true
		} else if (!isInitializedRef.current && (!value || value === '')) {
			const t = getCurrentTime()
			setSelectedHour(t.hour)
			setSelectedMinute(t.minute)
			setSelectedAmpm(t.ampm)
			onChange(t.formatted)
			previousValueRef.current = t.formatted
			isInitializedRef.current = true
		}
	}, [value, onChange])

	const formatTime = (hour: number, minute: string, ampm: string) => {
		let h = hour
		if (ampm === 'PM' && hour !== 12) h += 12
		if (ampm === 'AM' && hour === 12) h = 0
		return `${String(h).padStart(2, '0')}:${minute}`
	}

	const handleHourChange = (hour: number) => {
		setSelectedHour(hour)
		onChange(formatTime(hour, selectedMinute, selectedAmpm))
	}

	const handleMinuteChange = (minute: string) => {
		setSelectedMinute(minute)
		onChange(formatTime(selectedHour, minute, selectedAmpm))
	}

	const handleAmpmChange = (ampm: string) => {
		setSelectedAmpm(ampm)
		onChange(formatTime(selectedHour, selectedMinute, ampm))
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen])

	const displayTime = `${String(selectedHour).padStart(2, '0')}:${selectedMinute} ${selectedAmpm}`

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<button type="button" onClick={() => setIsOpen(!isOpen)} className="orbit-timepicker-trigger">
				<span className="orbit-body">{displayTime}</span>
				<i className={isOpen ? 'ri-arrow-down-s-line orbit-muted rotate-180 transition-transform' : 'ri-arrow-down-s-line orbit-muted transition-transform'}></i>
			</button>

			{isOpen && (
				<div className="orbit-timepicker-menu">
					<div className="flex gap-3">
						<div className="flex-1">
							<div className="orbit-timepicker-col-title">{t('Manage.Appointments.TimePicker_Hour', 'Hour')}</div>
							<div className="max-h-48 overflow-y-auto">
								{hours12.map((h) => (
									<button key={h} type="button" onClick={() => handleHourChange(h)} className={selectedHour === h ? 'orbit-timepicker-option orbit-timepicker-option--selected' : 'orbit-timepicker-option'}>
										{String(h).padStart(2, '0')}
									</button>
								))}
							</div>
						</div>

						<div className="flex-1">
							<div className="orbit-timepicker-col-title">{t('Manage.Appointments.TimePicker_Minute', 'Minute')}</div>
							<div className="max-h-48 overflow-y-auto">
								{allowedMinutes.map((m) => (
									<button key={m} type="button" onClick={() => handleMinuteChange(m)} className={selectedMinute === m ? 'orbit-timepicker-option orbit-timepicker-option--selected' : 'orbit-timepicker-option'}>
										{m}
									</button>
								))}
							</div>
						</div>

						<div className="flex-1">
							<div className="orbit-timepicker-col-title">{t('Manage.Appointments.TimePicker_Period', 'Period')}</div>
							<div className="max-h-48 overflow-y-auto">
								{ampmOptions.map((a) => (
									<button key={a} type="button" onClick={() => handleAmpmChange(a)} className={selectedAmpm === a ? 'orbit-timepicker-option orbit-timepicker-option--selected' : 'orbit-timepicker-option'}>
										{a}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default function AppointmentTime({ value = [], onChange, hideAddButton = false }: AppointmentTimeProps) {
	const { t } = useTranslation()
	const [rows, setRows] = useState<any[]>([])
	const [errors] = useState<Record<string, { date?: string; fromTime?: string; toTime?: string }>>({})
	const hasInitialized = useRef(false)
	const previousValueRef = useRef<any[]>([])

	useEffect(() => {
		const valueChanged = JSON.stringify(value) !== JSON.stringify(previousValueRef.current)
		if (hasInitialized.current && !valueChanged) return
		if (value && value.length > 0) {
			const withIds = value.map((v) => ({
				id: v.id ?? Date.now() + Math.random(),
				date: v.date ?? getTomorrow(),
				fromTime: v.fromTime ?? getCurrentTime().formatted,
				toTime: v.toTime ?? getCurrentTime().formatted,
			}))
			setRows(withIds)
			previousValueRef.current = value
		} else if (!hasInitialized.current) {
			const t = getCurrentTime()
			const initialRow = {
				id: Date.now(),
				date: getTomorrow(),
				fromTime: t.formatted,
				toTime: t.formatted,
			}
			setRows([initialRow])
			onChange([initialRow])
			previousValueRef.current = []
		}

		hasInitialized.current = true
	}, [value, onChange])

	const triggerOnChange = (newRows: any[]) => {
		setRows(newRows)
		onChange(newRows)
	}

	const handleAddRow = () => {
		const newRow = {
			id: Date.now(),
			date: getTomorrow(),
			fromTime: getCurrentTime().formatted,
			toTime: getCurrentTime().formatted,
		}
		triggerOnChange([...rows, newRow])
	}

	const handleDeleteRow = (id: number) => {
		if (rows.length === 1) {
			const cleared = [{ id: rows[0].id, date: '', fromTime: '00:00', toTime: '00:00' }]
			triggerOnChange(cleared)
			return
		}
		const updated = rows.filter((r) => r.id !== id)
		triggerOnChange(updated)
	}

	const handleChange = (id: number, field: string, value: string) => triggerOnChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

	const handleTimeChange = (id: number, field: 'fromTime' | 'toTime', time: string) => triggerOnChange(rows.map((r) => (r.id === id ? { ...r, [field]: time } : r)))

	return (
		<div className="w-full">
			<div className="space-y-1.5 mb-6 relative">
				<Label variant="section">{t('Manage.Appointments.Schedule_Heading', 'Schedule')}</Label>

				{/* Header row - shown only once */}
				<div className="flex gap-2 mb-2">
					<div className="w-1/3">
						<Label variant="section" className="font-semibold orbit-muted block mb-2 text-sm">
							{t('Manage.Appointments.Schedule_Date', 'Date')}
						</Label>
					</div>
					<div className="w-1/3">
						<Label variant="section">{t('Manage.Appointments.Schedule_From', 'From')}</Label>
					</div>
					<div className="w-1/3">
						<Label variant="section">{t('Manage.Appointments.Schedule_To', 'To')}</Label>
					</div>
					<div className="w-8"></div>
				</div>

				{rows.map((row, idx) => (
					<>
						<div key={row.id} className="flex gap-2 items-start mb-2">
							<div className="w-1/3">
								<input type="date" name={`date_${row.id}`} value={row.date} onChange={(e) => handleChange(row.id, 'date', e.target.value)} min={getTomorrow()} className="form-input" />
								{errors[row.id]?.date && <p className="orbit-field-error text-sm mt-1">{errors[row.id].date}</p>}
							</div>
							<div className="w-1/3">
								<TimePicker name={`fromTime_${row.id}`} value={row.fromTime} onChange={(time) => handleTimeChange(row.id, 'fromTime', time)} field="fromTime" />
								{errors[row.id]?.fromTime && <p className="orbit-field-error text-sm mt-1">{errors[row.id].fromTime}</p>}
							</div>

							<div className="w-1/3">
								<TimePicker name={`toTime_${row.id}`} value={row.toTime} onChange={(time) => handleTimeChange(row.id, 'toTime', time)} field="toTime" />
								{errors[row.id]?.toTime && <p className="orbit-field-error text-sm mt-1">{errors[row.id].toTime}</p>}
							</div>

							<button type="button" className="px-2 py-1 text-sm orbit-danger-text orbit-danger-hover" onClick={() => handleDeleteRow(row.id)}>
								✕
							</button>
						</div>
						{idx === rows.length - 1 && !hideAddButton && (
							<button onClick={handleAddRow} className="mt-1 text-xs orbit-link hover:underline flex items-center gap-1">
								<span>＋</span> Add another
							</button>
						)}
					</>
				))}
			</div>
		</div>
	)
}
