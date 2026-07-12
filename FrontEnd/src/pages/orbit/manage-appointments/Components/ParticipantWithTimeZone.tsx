import { useState, useRef, useEffect } from 'react'
import { EmptyState, Label } from '@/components'
import useOutsideClick from '@/hooks/useClickOutside'
import { NexusLookUpCodeTypes, UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import { DropDownService } from '@/services/DropDownService'
import { commonHelper } from '@/helpers/common.helper'
import { useTranslation } from 'react-i18next'

export interface ParticipantWithTimeZone {
	user: UserDropDownItemResponse | null
	timeZone: string
}

interface DropdownProps {
	label: string
	onChange: (list: ParticipantWithTimeZone[]) => void
	value?: ParticipantWithTimeZone[]
	excludedParticipants?: ParticipantWithTimeZone[]
}

interface ModalState {
	search: string
	open: boolean
	activeRowId: number | null
	participants: UserDropDownItemResponse[]
	loading: boolean
	error: string

	userTimeZone: UserDropDownItemResponse[]
	timeZoneOpen: boolean
	activeTimeZoneRowId: number | null
	timeZoneSearch: string
}

interface RowState extends ParticipantWithTimeZone {
	id: number
}

export default function ParticipantsDropdown({ label, onChange, value, excludedParticipants = [] }: DropdownProps) {
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		search: '',
		open: false,
		activeRowId: null,
		participants: [],
		loading: true,
		error: '',

		userTimeZone: [],
		timeZoneOpen: false,
		activeTimeZoneRowId: null,
		timeZoneSearch: '',
	})

	const [rows, setRows] = useState<RowState[]>(() => {
		if (value && value.length > 0) {
			return value.map((v, index) => ({
				id: index + 1,
				user: v.user,
				timeZone: v.timeZone,
			}))
		}
		// start with a single empty row
		return [{ id: 1, user: null, timeZone: '' }]
	})

	const dropdownRef = useRef<HTMLDivElement>(null)

	const assignModalValue = (key: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	const fetchItems = async () => {
		try {
			assignModalValue('loading', true)
			const data = await DropDownService.getSystemUsers(true)
			assignModalValue('participants', data)
		} catch (error) {
			assignModalValue('error', 'Failed to load participants')
		} finally {
			assignModalValue('loading', false)
		}
	}

	const fetchTimeZones = async () => {
		try {
			// ⬇️ Replace this with your actual timezone API if different
			const data = await DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone)
			assignModalValue('userTimeZone', data)
		} catch (error) {
			console.error('Failed to load timezones', error)
		}
	}

	useEffect(() => {
		fetchItems()
		fetchTimeZones()
	}, [])

	// If parent updates `value`, sync into our rows
	useEffect(() => {
		if (value) {
			if (value.length === 0) {
				setRows([{ id: 1, user: null, timeZone: '' }])
			} else {
				setRows(
					value.map((v, index) => ({
						id: index + 1,
						user: v.user,
						timeZone: v.timeZone,
					}))
				)
			}
		}
	}, [value])

	// Helper: propagate changes to parent
	const emitChange = (updatedRows: RowState[]) => {
		const result: ParticipantWithTimeZone[] = updatedRows.map((r) => ({
			user: r.user,
			timeZone: r.timeZone,
		}))
		onChange(result)
	}

	// Build a set of excluded user IDs (from other dropdown’s rows)
	const excludedStrValues = new Set(excludedParticipants.map((ep) => ep.user?.strValue).filter((x): x is string => Boolean(x)))

	// Build a set of already selected users in this control
	const selectedStrValues = new Set(rows.map((r) => r.user?.strValue).filter((x): x is string => Boolean(x)))

	const filteredParticipants = modalState.participants.filter((p) => {
		const matchesSearch = p.text?.toLowerCase().includes(modalState.search.toLowerCase())
		const notAlreadySelected = !selectedStrValues.has(p.strValue || '')
		const notExcluded = !excludedStrValues.has(p.strValue || '')
		return matchesSearch && notAlreadySelected && notExcluded
	})

	const filteredTimeZones = modalState.userTimeZone.filter((tz) => tz.text?.toLowerCase().includes(modalState.timeZoneSearch.toLowerCase()))

	const handleOpenDropdown = (rowId: number) => {
		assignModalValue('open', true)
		assignModalValue('activeRowId', rowId)
		assignModalValue('search', '')
		// close timezone dropdown when opening participant dropdown
		assignModalValue('timeZoneOpen', false)
		assignModalValue('activeTimeZoneRowId', null)
	}

	const handleSelectUser = (user: UserDropDownItemResponse) => {
		if (modalState.activeRowId === null) return

		const timeZone = user.timeZone || commonHelper.getCurrentUserTimeZone()

		const updated = rows.map((r) => {
			if (r.id === modalState.activeRowId) {
				return {
					...r,
					user,
					timeZone: timeZone, //r.timeZone || commonHelper.getCurrentUserTimeZone(),
				}
			}
			return r
		})
		setRows(updated)
		emitChange(updated)

		assignModalValue('open', false)
		assignModalValue('search', '')
		assignModalValue('activeRowId', null)
	}

	const handleTimeZoneChange = (rowId: number, timezone: string) => {
		const updated = rows.map((r) => (r.id === rowId ? { ...r, timeZone: timezone } : r))
		setRows(updated)
		emitChange(updated)
	}

	const handleAddRow = () => {
		const newRow: RowState = {
			id: Date.now(),
			user: null,
			timeZone: commonHelper.getCurrentUserTimeZone(),
		}
		const updated = [...rows, newRow]
		setRows(updated)
		emitChange(updated)
	}

	const handleRemoveRow = (rowId: number) => {
		if (rows.length === 1) {
			// keep at least one row; just clear it
			const cleared: RowState[] = [{ ...rows[0], user: null, timeZone: '' }]
			setRows(cleared)
			emitChange(cleared)
			return
		}

		const updated = rows.filter((r) => r.id !== rowId)
		setRows(updated)
		emitChange(updated)
	}

	useOutsideClick(dropdownRef, () => {
		assignModalValue('open', false)
		assignModalValue('timeZoneOpen', false)
		assignModalValue('activeRowId', null)
		assignModalValue('activeTimeZoneRowId', null)
	})

	return (
		<div className="orbit-participants-field" ref={dropdownRef}>
			<Label variant="field">{label}</Label>

			<div className="space-y-2">
				{rows.map((row) => {
					const participantDivRef = (el: HTMLDivElement | null) => {
						if (el) {
							el.setAttribute('name', 'AppointmentParticipants')
						}
					}
					return (
						<div key={row.id} className="orbit-participants-row">
							{/* Participant single-select */}
							<div className="flex-1 relative" onClick={() => handleOpenDropdown(row.id)}>
								<div 
									ref={participantDivRef}
									className="orbit-participants-select"
								>
									<span className={row.user ? '' : 'orbit-placeholder'}>{row.user?.text || 'Select participant...'}</span>
									<span className="ml-2 orbit-placeholder">▾</span>
								</div>
							</div>

							{/* TimeZone dropdown (searchable) */}
							<div
								className="w-40 relative"
								onClick={(e) => {
									e.stopPropagation()
									assignModalValue('timeZoneOpen', true)
									assignModalValue('activeTimeZoneRowId', row.id)
									assignModalValue('timeZoneSearch', '')
									// close participant dropdown when opening timezone dropdown
									assignModalValue('open', false)
									assignModalValue('activeRowId', null)
								}}
							>
								<div className="orbit-participants-select">
									<span className={row.timeZone ? '' : 'orbit-placeholder'}>{row.timeZone || t('Manage.Appointments.Participants_SelectTimezone', 'Select Timezone')}</span>
									<span className="ml-2 orbit-placeholder">▾</span>
								</div>

								{/* Timezone dropdown positioned relative to this cell */}
								{modalState.timeZoneOpen && modalState.activeTimeZoneRowId === row.id && (
									<div className="orbit-timepicker-menu z-30 min-w-[200px]">
										<div className="orbit-participants-menu-input-wrap">
											<input type="text" className="orbit-participants-menu-input" placeholder={t('Manage.Appointments.Participants_PlaceholderSearchTimezone', 'Search timezone...')} value={modalState.timeZoneSearch} onChange={(e) => assignModalValue('timeZoneSearch', e.target.value)} onClick={(e) => e.stopPropagation()} />
										</div>

										<div className="max-h-52 overflow-y-auto">
											{filteredTimeZones.length === 0 && <EmptyState title={t('Manage.Appointments.Participants_NoTimezonesFound', 'No timezones found')} />}

											{filteredTimeZones.map((tz) => (
												<div
													key={tz.strValue}
													className="orbit-participants-menu-item"
													onClick={(e) => {
														e.stopPropagation()
														if (modalState.activeTimeZoneRowId === null) return

														handleTimeZoneChange(modalState.activeTimeZoneRowId, tz.text || '')
														assignModalValue('timeZoneOpen', false)
														assignModalValue('activeTimeZoneRowId', null)
													}}
												>
													{tz.text}
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							<button type="button" className="orbit-participants-remove" onClick={() => handleRemoveRow(row.id)}>
								✕
							</button>
						</div>
					)
				})}

				{/* Add more */}
				<button type="button" className="orbit-participants-add" onClick={handleAddRow}>
					<span>＋</span> {t('Manage.Appointments.Participants_AddAnother', 'Add another')}
				</button>
			</div>

			{/* Participant dropdown menu (shared for whichever row is active) */}
			{modalState.open && (
				<div className="orbit-participants-menu">
					<div className="orbit-participants-menu-input-wrap">
						<input type="text" className="orbit-participants-menu-input" placeholder={t('Manage.Appointments.Participants_PlaceholderSearchParticipants', 'Search participants...')} value={modalState.search} onChange={(e) => assignModalValue('search', e.target.value)} autoFocus onClick={(e) => e.stopPropagation()} />
					</div>

					{modalState.loading && <div className="px-3 py-2 orbit-muted text-sm">{t('Manage.Appointments.Participants_Loading', 'Loading participants...')}</div>}
					{modalState.error && <div className="px-3 py-2 orbit-field-error text-sm">{modalState.error}</div>}
					{!modalState.loading && !modalState.error && filteredParticipants.length === 0 && <EmptyState title={t('Manage.Appointments.Participants_NoParticipantsFound', 'No participants found')} />}
					{!modalState.loading &&
						!modalState.error &&
						filteredParticipants.map((p) => (
							<div
								key={p.strValue}
								className="orbit-participants-menu-item"
								onClick={(e) => {
									e.stopPropagation()
									handleSelectUser(p)
								}}
							>
								{p.text}
							</div>
						))}
				</div>
			)}
		</div>
	)
}
