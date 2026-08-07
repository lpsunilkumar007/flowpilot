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
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatRoleDisplayName } from '../helpers/userRoles.helper'

interface AssignRolesProps {
	assignRoleOutPut: (isAdded: boolean) => void
	id: string
}

const AssignRoles: React.FC<AssignRolesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [allRoles, setAllRoles] = useState<RoleDto[]>([])
	const [updateUserRolesRequest, setUpdateUserRolesRequest] = useState<UserRolesRequest>()

	const { hasAnyPermissions } = useAnyPermissions()
	const loadingIndicator = () => <AnimationSkeleton />

	const handleCheckboxChange = (roleId: string) => {
		if (updateUserRolesRequest?.userRoles) {
			const updatedRoles = updateUserRolesRequest.userRoles.map((role) => {
				if (role.roleId === roleId) {
					return new UserRoleResponse({
						...role,
						enabled: !role.enabled,
					})
				}
				return role
			})
			setUpdateUserRolesRequest(
				new UserRolesRequest({
					...updateUserRolesRequest,
					userRoles: updatedRoles,
				})
			)
		}
	}

	const columnDefs = useMemo(
		() =>
			[
				{
					headerName: t('Manage.AssignRole.Grid_Name', 'Name'),
					field: 'name',
					sort: 'asc',
					sortingOrder: ['asc', 'desc'],
					comparator: gridHelper.sortingComparator,
					valueFormatter: (params: { value?: string }) => formatRoleDisplayName(params.value),
				},
				{ headerName: t('Manage.AssignRole.Grid_Description', 'Description'), field: 'description', sortable: false },
				{
					headerName: t('Manage.AssignRole.Grid_Select', 'Select'),
					field: 'selected',
					sortable: false,
					cellRenderer: (params: any) => {
						const role = updateUserRolesRequest?.userRoles?.find((x) => x.roleId === params.data.id)
						const isChecked = role && role.enabled
						return <input type="checkbox" className="form-checkbox rounded text-primary h-4 w-4" checked={!!isChecked} onChange={() => handleCheckboxChange(params.data.id)} />
					},
				},
			] as any,
		[t, updateUserRolesRequest]
	)

	useEffect(() => {
		const fetchData = async () => {
			await fetchAllRoles()
			await fetchUserRoles()
		}
		void fetchData()
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
			const request = new UserRolesRequest()
			request.userRoles = userRoles
			setUpdateUserRolesRequest(request)
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async () => {
		if (!updateUserRolesRequest) return
		await runWithToast(() => userService.assignRoles(props.id, updateUserRolesRequest), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response!)
				props.assignRoleOutPut(true)
			},
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.AssignRole.AssignRole_Heading', 'Assign Roles')} onClose={() => props.assignRoleOutPut(false)} />
				{loading && loadingIndicator()}
				{!loading && updateUserRolesRequest && (
					<PopupBody>
						<DataGridWithoutPagination rowData={allRoles} columnDefs={columnDefs} />
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
