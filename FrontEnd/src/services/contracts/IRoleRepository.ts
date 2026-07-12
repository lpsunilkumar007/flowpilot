import type {
	CreateOrUpdateRoleRequest,
	RoleDto,
	SystemPermission,
	UpdateRolePermissionsRequest,
} from '@/helpers/api/WebApiClient'

export interface IRoleRepository {
	getList(): Promise<RoleDto[]>
	getById(id: string): Promise<RoleDto>
	getByIdWithPermissions(id: string): Promise<RoleDto>
	registerRole(request: CreateOrUpdateRoleRequest): Promise<string>
	delete(id: string): Promise<string>
	getAllPermissionList(): Promise<SystemPermission[]>
	updatePermissions(id: string, request: UpdateRolePermissionsRequest): Promise<string>
}
