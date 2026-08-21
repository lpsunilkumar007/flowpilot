import { PopupBody, PopupFooter, PopupHeader, PopupWrapper, TabsWrapper } from '@/components'
import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { PermissionTypes } from '@/constants/permissions'
import { SystemPermission, UpdateRolePermissionsRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { gridHelper } from '@/helpers/grid.helper'
import { messageHelper } from '@/helpers/message.helper'
import { useAnyPermissions } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { roleService } from '@/services/RoleService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface ManageRolePermissionsProps {
	editRolePermissionOutPut: (isAdded: boolean) => void
	id: string
}

const ManageRolePermissions: React.FC<ManageRolePermissionsProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const { hasAnyPermissions } = useAnyPermissions()
	const [allSystemPermission, setAllSystemPermission] = useState<SystemPermission[]>([])

	const [distinctResources, setDistinctResources] = useState<string[]>()
	const [updateRolePermissionsRequest, setUpdateRolePermissionsRequest] = useState<UpdateRolePermissionsRequest>()

	const loadingIndicator = () => <AnimationSkeleton />
	const getColumnDefs = () =>
		[
			{ headerName: 'Name', field: 'name', sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator, minWidth: 200 },
			{ headerName: 'Description', field: 'description', sortable: false, minWidth: 200 },
			{
				headerName: 'Select',
				field: 'selected',
				sortable: false,
				cellRenderer: (params: any) => {
					const isChecked = updateRolePermissionsRequest?.permissions?.includes(params.data.name)
					return <input type="checkbox" className="form-checkbox rounded text-primary h-4 w-4" checked={isChecked} onChange={() => handleCheckboxChange(params.data.name)} />
				},
				minWidth: 200,
				flex: 1,
			},
		] as any

	useEffect(() => {
		const fetchData = async () => {
			await fetchAllPermissions()
			await fetchRolePermission()
		}
		fetchData()
	}, [])
	const fetchAllPermissions = async () => {
		try {
			const response = await roleService.getAllPermissionList()
			setAllSystemPermission(response)
			const resources = Array.from(new Set(response.map((permission) => permission.resource))).filter((resource): resource is string => resource !== undefined)
			setDistinctResources(resources)
		} finally {
			setLoading(false)
		}
	}

	const fetchRolePermission = async () => {
		try {
			const response = await roleService.getByIdWithPermissions(props.id)

			const updateRolePermissionsRequest = new UpdateRolePermissionsRequest()
			updateRolePermissionsRequest.roleId = props.id
			updateRolePermissionsRequest.permissions = response.permissions || []
			setUpdateRolePermissionsRequest(updateRolePermissionsRequest)
		} finally {
			setLoading(false)
		}
	}

	const handleCheckboxChange = (permission: string) => {
		setUpdateRolePermissionsRequest((prev: any) => {
			if (!prev) {
				return {
					roleId: '',
					permissions: [permission],
					init: () => {},
					toJSON: () => ({}),
				}
			}

			const newPermissions = prev.permissions!.includes(permission) ? prev.permissions!.filter((perm: any) => perm !== permission) : [...prev.permissions!, permission]

			return {
				...prev,
				permissions: newPermissions,
				init: prev.init,
				toJSON: prev.toJSON,
			}
		})
	}

	const onSubmit = async () => {
		if (!updateRolePermissionsRequest) return
		await runWithToast(() => roleService.updatePermissions(props.id, updateRolePermissionsRequest), {
			onSuccess: (response) => messageHelper.showSuccess(response!),
		})
	}

	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.Permissions.Edit_Heading', 'Manage Permissions')} onClose={() => props.editRolePermissionOutPut(false)} />
				{loading && loadingIndicator()}
				{!loading && (
					<>
						<PopupBody>
							<TabsWrapper
								variant="card"
								tabListClassName="permission-tabs"
								tabPanelsClassName="border dark:border-gray-600 p-2"
								tabs={(distinctResources || []).map((resource) => {
									const totalPermissions = allSystemPermission.filter((perm) => perm.resource === resource).length
									const selectedPermissionsCount = (updateRolePermissionsRequest?.permissions || []).filter((perm) => allSystemPermission.some((p) => p.name === perm && p.resource === resource)).length

									return {
										key: resource,
										title: (
											<>
												{resource} ({selectedPermissionsCount}/{totalPermissions})
											</>
										),
										content: <DataGridWithoutPagination rowData={allSystemPermission.filter((permission) => permission.resource === resource)} columnDefs={getColumnDefs()} />,
									}
								})}
							/>
						</PopupBody>

						<PopupFooter className="mt-2">
							<button type="button" className="btn btn-secondary" onClick={() => props.editRolePermissionOutPut(false)}>
								{t('Manage.Permissions.Edit_Close', 'Close')}
							</button>

							{hasAnyPermissions([PermissionTypes.Permissions_Roles_Create, PermissionTypes.Permissions_Roles_Update]) && (
								<button onClick={onSubmit} className="btn btn-primary">
									{t('Manage.Permissions.Edit_Update', 'Update')}
								</button>
							)}
						</PopupFooter>
					</>
				)}
			</PopupWrapper>
		</>
	)
}

export default ManageRolePermissions
