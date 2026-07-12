import type {
	ChangePasswordForcefullyRequest,
	CreateUserRequest,
	CreateUserResponse,
	ForgotPasswordRequest,
	RegisterUserRequest,
	RegisterUserResponse,
	ResetForgotPasswordRequest,
	UpdateUserDetailsRequest,
	UserRoleResponse,
	UserRolesRequest,
	ViewUserDetailsResponse,
} from '@/helpers/api/WebApiClient'

export interface IUserRepository {
	getList(): Promise<ViewUserDetailsResponse[]>
	getById(id: string): Promise<ViewUserDetailsResponse>
	create(request: CreateUserRequest): Promise<CreateUserResponse>
	updateUser(id: string, request: UpdateUserDetailsRequest): Promise<string>
	changePasswordForcefully(id: string, request: ChangePasswordForcefullyRequest): Promise<string>
	getRoles(userId: string): Promise<UserRoleResponse[]>
	assignRoles(userId: string, request: UserRolesRequest): Promise<string>
	selfRegister(request: RegisterUserRequest): Promise<RegisterUserResponse>
	confirmEmail(userId: string, code: string): Promise<string>
	resetPassword(request: ResetForgotPasswordRequest): Promise<string>
	forgotPassword(request: ForgotPasswordRequest): Promise<string>
}
