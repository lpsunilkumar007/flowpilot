import { PermissionTypes } from '@/constants/permissions'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'

//Example usage
//const { userHasPermission } = usePermission()
//const canViewRoles = userHasPermission(PermissionTypes.PermissionsPermissions_Roles_View)

const usePermission = () => {
	const permissionData: string[] = useSelector((state: RootState) => state.Auth.userPermissions)

	return {
		userHasPermission: (permissionType: PermissionTypes) => {
			return permissionData.includes(permissionType.toString())
		},
	}
}

//Example usage:
//const { useHasPermissions } = usePermissions();
//const permissionsToCheck = [PermissionTypes.PermissionsPermissions_Roles_View, PermissionTypes.PermissionsPermissions_Users_View];
//const permissionResults = useHasPermissions(permissionsToCheck);

const usePermissions = () => {
	const permissionData: string[] = useSelector((state: RootState) => state.Auth.userPermissions)

	// Method to check multiple permissions and return a partial object with true/false values
	const useHasPermissions = (permissionsToCheck: PermissionTypes[]): Partial<Record<PermissionTypes, boolean>> => {
		const result: Partial<Record<PermissionTypes, boolean>> = {}

		permissionsToCheck.forEach((permission) => {
			result[permission] = permissionData.includes(permission.toString())
		})

		return result
	}

	return {
		useHasPermissions,
	}
}

//Example usage:
//const allPermissionsResults = useAllPermissions();
//console.log(allPermissionsResults);

const useAllPermissions = () => {
	// Convert enum to an array of its values
	const allPermissions = Object.values(PermissionTypes) as PermissionTypes[]

	// Use the existing usePermissions hook to check all permissions
	const { useHasPermissions } = usePermissions()

	// Get the permission results for all permissions
	const allPermissionsResults = useHasPermissions(allPermissions)

	return allPermissionsResults
}

const useAnyPermissions = () => {
	const permissionData: string[] = useSelector((state: RootState) => state.Auth.userPermissions)

	// Directly return the function as the hook's output
	const hasAnyPermissions = (permissionsToCheck: PermissionTypes[]): boolean => {
		return permissionsToCheck.some((permission) => permissionData.includes(permission.toString()))
	}

	return {
		hasAnyPermissions,
	}
}

export { usePermission, usePermissions, useAllPermissions, useAnyPermissions }
