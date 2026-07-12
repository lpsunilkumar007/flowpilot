import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { usePermission, useAnyPermissions } from './usePermission'
import { PermissionTypes } from '@/constants/permissions'

const createMockStore = (userPermissions: string[]) =>
	configureStore({
		reducer: {
			Auth: () => ({
				userPermissions: userPermissions ?? [],
			}),
			Layout: () => ({}),
		},
	}) as ReturnType<typeof configureStore>

const wrapper = (store: ReturnType<typeof configureStore>) => {
	return ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>
}

describe('usePermission', () => {
	it('returns true when user has the permission', () => {
		const store = createMockStore([PermissionTypes.Permissions_Users_View.toString()])
		const { result } = renderHook(() => usePermission(), {
			wrapper: wrapper(store),
		})

		expect(result.current.userHasPermission(PermissionTypes.Permissions_Users_View)).toBe(true)
	})

	it('returns false when user does not have the permission', () => {
		const store = createMockStore([])
		const { result } = renderHook(() => usePermission(), {
			wrapper: wrapper(store),
		})

		expect(result.current.userHasPermission(PermissionTypes.Permissions_Users_View)).toBe(false)
	})

	it('returns false for different permission when user has one permission', () => {
		const store = createMockStore([PermissionTypes.Permissions_Users_View.toString()])
		const { result } = renderHook(() => usePermission(), {
			wrapper: wrapper(store),
		})

		expect(result.current.userHasPermission(PermissionTypes.Permissions_Roles_View)).toBe(false)
	})
})

describe('useAnyPermissions', () => {
	it('returns true when user has at least one of the permissions', () => {
		const store = createMockStore([PermissionTypes.Permissions_Users_View.toString()])
		const { result } = renderHook(() => useAnyPermissions(), {
			wrapper: wrapper(store),
		})

		expect(
			result.current.hasAnyPermissions([PermissionTypes.Permissions_Users_View, PermissionTypes.Permissions_Roles_View])
		).toBe(true)
	})

	it('returns false when user has none of the permissions', () => {
		const store = createMockStore([])
		const { result } = renderHook(() => useAnyPermissions(), {
			wrapper: wrapper(store),
		})

		expect(
			result.current.hasAnyPermissions([PermissionTypes.Permissions_Users_View, PermissionTypes.Permissions_Roles_View])
		).toBe(false)
	})
})
