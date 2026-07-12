import { rolesClient } from '@/helpers/api/apiClients'
import type { IRoleRepository } from './contracts/IRoleRepository'

/**
 * Role service - abstraction over roles API client.
 * Use this instead of importing rolesClient directly for better testability.
 */
export const roleService: IRoleRepository = {
	getList: () => rolesClient.getList(),
	getById: (id) => rolesClient.getById(id),
	getByIdWithPermissions: (id) => rolesClient.getByIdWithPermissions(id),
	registerRole: (request) => rolesClient.registerRole(request),
	delete: (id) => rolesClient.delete(id),
	getAllPermissionList: () => rolesClient.getAllPermissionList(),
	updatePermissions: (id, request) => rolesClient.updatePermissions(id, request),
}
