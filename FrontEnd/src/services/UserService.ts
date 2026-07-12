import { usersClient } from '@/helpers/api/apiClients'
import type { IUserRepository } from './contracts/IUserRepository'

/**
 * User service - abstraction over users API client.
 * Use this instead of importing usersClient directly for better testability.
 */
export const userService: IUserRepository = {
	getList: () => usersClient.getList(),
	getById: (id) => usersClient.getById(id),
	create: (request) => usersClient.create(request),
	updateUser: (id, request) => usersClient.updateUser(id, request),
	changePasswordForcefully: (id, request) => usersClient.changePasswordForcefully(id, request),
	getRoles: (userId) => usersClient.getRoles(userId),
	assignRoles: (userId, request) => usersClient.assignRoles(userId, request),
	selfRegister: (request) => usersClient.selfRegister(request),
	confirmEmail: (userId, code) => usersClient.confirmEmail(userId, code),
	resetPassword: (request) => usersClient.resetPassword(request),
	forgotPassword: (request) => usersClient.forgotPassword(request),
}
