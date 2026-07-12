import { useState, useRef, useEffect } from 'react'
import { EmptyState, Label } from '@/components'
import useOutsideClick from '@/hooks/useClickOutside'
import { DropDownService } from '@/services/DropDownService'

interface DropDownItemResponse {
	value?: number
	text?: string
	isSelected?: boolean
	strValue?: string
}

interface DropdownProps {
	label: string
	onChange: (list: DropDownItemResponse[]) => void
	value?: DropDownItemResponse[]
	excludedParticipants?: DropDownItemResponse[]
}
interface ModalState {
	search: string
	open: boolean
	selected: DropDownItemResponse[]
	participants: DropDownItemResponse[]
	loading: boolean
	error: string
}
export default function ParticipantsDropdown({ label, onChange, value, excludedParticipants = [] }: DropdownProps) {
	const [modalState, setModalState] = useState<ModalState>({
		search: '',
		open: false,
		selected: value || [],
		participants: [],
		loading: true,
		error: '',
	})
	const dropdownRef = useRef<HTMLDivElement>(null)

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}
	const fetchItems = async () => {
		try {
			assignValueToModal('loading', true)

			const data = await DropDownService.getSystemUsers(true)
			assignValueToModal('participants', data)
		} catch (error) {
			assignValueToModal('error', 'Failed to load participants')
		} finally {
			assignValueToModal('loading', false)
		}
	}

	useEffect(() => {
		fetchItems()
	}, [])

	useEffect(() => {
		if (value) assignValueToModal('selected', value)
	}, [value])

	const filtered = modalState.participants.filter((p) => {
		const matchesSearch = p.text?.toLowerCase().includes(modalState.search.toLowerCase())
		const isNotSelected = !modalState.selected.some((s) => s.strValue === p.strValue)
		const isNotExcluded = !excludedParticipants.some((excluded) => excluded.strValue === p.strValue)
		return matchesSearch && isNotSelected && isNotExcluded
	})

	const handleSelect = (p: DropDownItemResponse) => {
		const newList = [...modalState.selected, p]
		assignValueToModal('selected', newList)
		onChange(newList)
		assignValueToModal('search', '')
	}

	const handleDelete = (strValue?: number | string) => {
		const newList = modalState.selected.filter((p) => String(p.strValue) !== String(strValue))
		assignValueToModal('selected', newList)
		onChange(newList)
	}

	useOutsideClick(dropdownRef, () => assignValueToModal('open', false))

	return (
		<div className="w-full relative" ref={dropdownRef}>
			<div className="space-y-1.5 mb-6 relative">
				<Label variant="field" className="mb-1">{label}</Label>

				<div className="orbit-multiselect-shell" onClick={() => assignValueToModal('open', true)}>
					{modalState.selected.map((p) => (
						<div key={p.strValue} className="orbit-multiselect-chip">
							<span>{p.text}</span>
							<button
								className="orbit-multiselect-chip-remove"
								onClick={(e) => {
									e.stopPropagation()
									handleDelete(p.strValue)
								}}
							>
								✕
							</button>
						</div>
					))}

					<input type="text" value={modalState.search} onChange={(e) => assignValueToModal('search', e.target.value)} placeholder={modalState.selected.length ? '' : 'Search participants...'} className="orbit-multiselect-input" onFocus={() => assignValueToModal('open', true)} />
				</div>

				{modalState.open && (
					<div className="orbit-participants-menu">
						{!modalState.loading && !modalState.error && filtered.length === 0 && <EmptyState title="No participants found" />}
						{!modalState.loading &&
							!modalState.error &&
							filtered.map((p) => (
								<div key={p.strValue} className="orbit-participants-menu-item" onClick={() => handleSelect(p)}>
									{p.text}
								</div>
							))}
					</div>
				)}
			</div>
		</div>
	)
}
