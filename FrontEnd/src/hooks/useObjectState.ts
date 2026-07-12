import { useCallback, useState } from 'react'

type Updater<T> = Partial<T> | ((prev: T) => Partial<T>)

export default function useObjectState<T extends Record<string, any>>(initialState: T) {
	const [state, setState] = useState<T>(initialState)

	const set = useCallback((patch: Updater<T>) => {
		setState((prev) => {
			const nextPatch = typeof patch === 'function' ? patch(prev) : patch
			return { ...prev, ...nextPatch }
		})
	}, [])

	const setKey = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
		setState((prev) => ({ ...prev, [key]: value }))
	}, [])

	return { state, setState, set, setKey }
}

