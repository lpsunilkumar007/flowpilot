import { PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { PermissionTypes } from '@/constants/permissions'
import { RoleDto, UserRoleResponse, UserRolesRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { gridHelper } from '@/helpers/grid.helper'
import { messageHelper } from '@/helpers/message.helper'
import { useAnyPermissions } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { roleService } from '@/services/RoleService'
import { userService } from '@/services/UserService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface AssignRolesProps {
	assignRoleOutPut: (isAdded: boolean) => void
	id: string
}

const AssignRoles: React.FC<AssignRolesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [allRoles, setAllRoles] = useState<RoleDto[]>([])
	//const [userRoles, setUserRoles] = useState<UserRoleResponse[]>([])
	const [updateUserRolesRequest, setUpdateUserRolesRequest] = useState<UserRolesRequest>()

	const { hasAnyPermissions } = useAnyPermissions()
	const loadingIndicator = () => <AnimationSkeleton />

	const getColumnDefs = () =>
		[
			{ headerName: t('Manage.AssignRole.Grid_Name', 'Name'), field: 'name', sort: 'asc', sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator },
			{ headerName: t('Manage.AssignRole.Grid_Description', 'Description'), field: 'description', sortable: false },
			{
				headerName: t('Manage.AssignRole.Grid_Select', 'Select'),
				field: 'selected',
				sortable: false,
				cellRenderer: (params: any) => {
					const role = updateUserRolesRequest?.userRoles?.find((x) => x.roleId === params.data.id)
					const isChecked = role && role.enabled
					return <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(params.data.id)} />
				},
			},
		] as any

	useEffect(() => {
		const fetchData = async () => {
			await fetchAllRoles()
			await fetchUserRoles()
		}
		fetchData()
	}, [])

	const fetchAllRoles = async () => {
		try {
			const response = await roleService.getList()
			setAllRoles(response)
		} finally {
			setLoading(false)
		}
	}

	const fetchUserRoles = async () => {
		try {
			const userRoles = await userService.getRoles(props.id)
			const updateUserRolesRequest = new UserRolesRequest()
			updateUserRolesRequest.userRoles = userRoles
			setUpdateUserRolesRequest(updateUserRolesRequest)
			//setUserRoles(userRoles)
		} finally {
			setLoading(false)
		}
	}
	const handleCheckboxChange = (roleId: string) => {
		if (updateUserRolesRequest?.userRoles) {
			const updatedRoles = updateUserRolesRequest.userRoles.map((role) => {
				if (role.roleId === roleId) {
					const updatedRole = new UserRoleResponse({
						...role,
						enabled: !role.enabled,
					})
					return updatedRole
				}
				return role
			})
			const updatedRequest = new UserRolesRequest({
				...updateUserRolesRequest,
				userRoles: updatedRoles,
			})
			setUpdateUserRolesRequest(updatedRequest)
		}
	}
	const onSubmit = async () => {
		if (!updateUserRolesRequest) return
		await runWithToast(() => userService.assignRoles(props.id, updateUserRolesRequest), {
			onSuccess: (response) => messageHelper.showSuccess(response!),
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.AssignRole.AssignRole_Heading', 'Assign Roles')} onClose={() => props.assignRoleOutPut(false)} />
				{loading && loadingIndicator()}
				{!loading && updateUserRolesRequest && (
					<PopupBody>
						<DataGridWithoutPagination rowData={allRoles} columnDefs={getColumnDefs()} />
					</PopupBody>
				)}

				<PopupFooter>
					<button className="btn btn-secondary" onClick={() => props.assignRoleOutPut(false)}>
						{t('Manage.AssignRole.Add_Close', 'Close')}
					</button>
					{hasAnyPermissions([PermissionTypes.Permissions_Users_Update, PermissionTypes.Permissions_Users_Create]) && (
						<button className="btn btn-primary" onClick={onSubmit}>
							{t('Manage.AssignRole.Add_Update', 'Update')}
						</button>
					)}
				</PopupFooter>
			</PopupWrapper>
		</>
	)
}

export default AssignRoles
