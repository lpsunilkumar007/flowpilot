import { useState, useCallback } from 'react'

/**
 * Centralized hook for orbit module modal state.
 * Reduces boilerplate for common modal flows: Add, Edit, and action modals with a selected entity.
 *
 * @example
 * const { modalState, toggleModal, openModal, closeModal, setSelectedId } = useModalState({
 *   addKey: 'isAddVisible',
 *   editKey: 'isEditVisible',
 *   selectedIdKey: 'selectedId',
 *   actionKeys: ['isAssignRolesVisible', 'isChangePasswordVisible'],
 * })
 */
export function useModalState<T extends Record<string, boolean | string>>(config: {
	initialState: T
}) {
	const [modalState, setModalState] = useState<T>(config.initialState)

	const toggleModal = useCallback(<K extends keyof T>(key: K) => {
		setModalState((prev) => ({
			...prev,
			[key]: !prev[key] as T[K],
		}))
	}, [])

	const openModal = useCallback(<K extends keyof T>(key: K, value?: T[K]) => {
		setModalState((prev) => ({
			...prev,
			[key]: value ?? true,
		}))
	}, [])

	const closeModal = useCallback(<K extends keyof T>(key: K) => {
		setModalState((prev) => ({
			...prev,
			[key]: false as T[K],
		}))
	}, [])

	const setKey = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
		setModalState((prev) => ({
			...prev,
			[key]: value,
		}))
	}, [])

	return { modalState, setModalState, toggleModal, openModal, closeModal, setKey }
}
