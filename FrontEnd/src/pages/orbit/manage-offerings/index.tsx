import { FormInput, PageBreadcrumbsWithLinks, VerticalForm } from '@/components'
import ActionDropdown from '@/components/ActionDropdown'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { ModalLayout } from '@/components/HeadlessUI'
import Pagination from '@/components/Pagination'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MODAL_PANEL_CLASS } from '@/constants'
import { MenuLinks } from '@/constants/menu'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import { offeringService } from '@/services/OfferingService'
import { OfferingStatus, OfferingType, type CreateOfferingRequest, type ViewOfferingResponse } from '@/types/crm/offering.types'
import type { UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

type OfferingFormValues = {
	name: string
	type: string
	status: string
	description?: string
	ownerUserId: string
	expectedValueFrom?: number | string
	expectedValueTo?: number | string
}

const toNumberOrUndefined = (value?: number | string) => {
	if (value === undefined || value === null || value === '') return undefined
	return Number(value)
}

const ManageOfferings: React.FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { userHasPermission } = usePermission()
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageOfferings_Create)
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageOfferings_Update)
	const canDelete = userHasPermission(PermissionTypes.Permissions_ManageOfferings_Delete)
	const canCreateLead = userHasPermission(PermissionTypes.Permissions_ManageLeads_Create)
	const canViewLeads = userHasPermission(PermissionTypes.Permissions_ManageLeads_View)
	const canViewPipeline = userHasPermission(PermissionTypes.Permissions_ManageSalePipelines_View)

	const [loading, setLoading] = useState(true)
	const [offerings, setOfferings] = useState<ViewOfferingResponse[]>([])
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
	const [totalPages, setTotalPages] = useState(1)
	const [currentPage, setCurrentPage] = useState(0)
	const [hasPreviousPage, setHasPreviousPage] = useState(false)
	const [hasNextPage, setHasNextPage] = useState(false)
	const [totalCount, setTotalCount] = useState(0)
	const [searchText, setSearchText] = useState('')
	const [typeFilter, setTypeFilter] = useState<string>('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [editingOffering, setEditingOffering] = useState<ViewOfferingResponse | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<ViewOfferingResponse | null>(null)
	const [showModal, setShowModal] = useState(false)

	const schemaResolver = yupResolver(
		yup.object().shape({
			name: yup.string().trim().required('This field cannot be left empty'),
			type: yup.string().required('Please select a value'),
			status: yup.string().required('Please select a value'),
			ownerUserId: yup.string().required('Please select a value'),
			expectedValueFrom: yup.number().transform((value, originalValue) => (originalValue === '' ? undefined : value)).nullable(),
			expectedValueTo: yup
				.number()
				.transform((value, originalValue) => (originalValue === '' ? undefined : value))
				.nullable()
				.test('range', 'Expected value to must be greater than or equal to from', function (value) {
					const from = this.parent.expectedValueFrom
					return !from || !value || value >= from
				}),
		})
	)

	useEffect(() => {
		DropDownService.getSystemUsers(false)
			.then((list) => setUsers(list ?? []))
			.catch(() => setUsers([]))
	}, [])

	const fetchOfferings = useCallback(
		async (pageNumber: number, overrides?: { searchText?: string; type?: string; status?: string }) => {
			await runWithToast(
				async () => {
					const res = await offeringService.search({
						pageNumber,
						pageSize: PagingVariables.DefaultPageSize,
						searchText: overrides?.searchText ?? (searchText || undefined),
						type: (overrides?.type ?? typeFilter) !== '' ? (Number(overrides?.type ?? typeFilter) as OfferingType) : undefined,
						status: (overrides?.status ?? statusFilter) !== '' ? (Number(overrides?.status ?? statusFilter) as OfferingStatus) : undefined,
					})
					setOfferings(res.data ?? [])
					setTotalPages(res.totalPages)
					setCurrentPage(res.currentPage)
					setHasPreviousPage(res.hasPreviousPage)
					setHasNextPage(res.hasNextPage)
					setTotalCount(res.totalCount)
					return res
				},
				{ setLoading }
			)
		},
		[searchText, statusFilter, typeFilter]
	)

	useEffect(() => {
		fetchOfferings(0)
	}, [fetchOfferings])

	const userNameById = useMemo(() => {
		const map = new Map<string, string>()
		users.forEach((u) => {
			if (u.strValue) map.set(u.strValue, u.text ?? u.strValue)
		})
		return map
	}, [users])

	const openCreate = () => {
		setEditingOffering(null)
		setShowModal(true)
	}

	const openEdit = (offering: ViewOfferingResponse) => {
		setEditingOffering(offering)
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		setEditingOffering(null)
	}

	const handleSubmit = async (values: OfferingFormValues) => {
		const payload: CreateOfferingRequest = {
			name: values.name.trim(),
			type: Number(values.type) as OfferingType,
			status: Number(values.status) as OfferingStatus,
			description: values.description?.trim() || undefined,
			ownerUserId: values.ownerUserId,
			expectedValueFrom: toNumberOrUndefined(values.expectedValueFrom),
			expectedValueTo: toNumberOrUndefined(values.expectedValueTo),
		}

		const action = editingOffering
			? () => offeringService.update(editingOffering.id, { ...payload, id: editingOffering.id })
			: () => offeringService.create(payload)

		await runWithToast(action, {
			onSuccess: (response: any) => {
				messageHelper.showSuccess(typeof response === 'string' ? response : response.message)
				closeModal()
				fetchOfferings(currentPage)
			},
		})
	}

	const handleStatusToggle = async (offering: ViewOfferingResponse) => {
		const nextStatus = Number(offering.status) === OfferingStatus.Active ? OfferingStatus.Inactive : OfferingStatus.Active
		await runWithToast(() => offeringService.updateStatus(offering.id, { status: nextStatus }), {
			onSuccess: (message) => {
				messageHelper.showSuccess(message)
				fetchOfferings(currentPage)
			},
		})
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		await runWithToast(() => offeringService.delete(deleteTarget.id), {
			onSuccess: (message) => {
				messageHelper.showSuccess(message)
				setDeleteTarget(null)
				fetchOfferings(currentPage)
			},
		})
	}

	const handleReset = () => {
		setSearchText('')
		setTypeFilter('')
		setStatusFilter('')
		fetchOfferings(0, { searchText: '', type: '', status: '' })
	}

	const buildOfferingUrl = (baseUrl: string, offeringUniqueId: string) => `${baseUrl}?offeringUid=${encodeURIComponent(offeringUniqueId)}`

	const modalDefaults = editingOffering
		? {
				name: editingOffering.name,
				type: String(editingOffering.type),
				status: String(editingOffering.status),
				description: editingOffering.description ?? '',
				ownerUserId: editingOffering.ownerUserId,
				expectedValueFrom: editingOffering.expectedValueFrom ?? '',
				expectedValueTo: editingOffering.expectedValueTo ?? '',
			}
		: {
				name: '',
				type: String(OfferingType.Product),
				status: String(OfferingStatus.Active),
				description: '',
				ownerUserId: users[0]?.strValue ?? '',
				expectedValueFrom: '',
				expectedValueTo: '',
			}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Offerings_Heading', 'Offerings')} subNames={[{ label: t('Manage.Offerings.Breadcrumb', 'Offerings') }]} />

			<PageWrapper>
				<PageTitle
					actions={
						canCreate && (
							<button type="button" className="btn btn-primary inline-flex items-center gap-2 shadow-sm" onClick={openCreate}>
								<i className="ri-add-line" />
								{t('Manage.Offerings.Action_Add', 'Create Offering')}
							</button>
						)
					}
				/>
				<PageBody>
					<div className="space-y-5">
						<div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
							<FormInput label={t('Manage.Offerings.Filter_Search', 'Search offerings')} name="searchText" type="text" className="form-input" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={t('Manage.Offerings.SearchPlaceholder', 'Name, description, offering ID...')} />
							<FormInput label={t('Manage.Offerings.Type', 'Type')} name="typeFilter" type="bottom-sheet" className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
								<option value="">{t('Common.All', 'All')}</option>
								<option value={OfferingType.Product}>{t('Manage.Offerings.Type_Product', 'Product')}</option>
								<option value={OfferingType.Project}>{t('Manage.Offerings.Type_Project', 'Project')}</option>
							</FormInput>
							<FormInput label={t('Manage.Offerings.Status', 'Status')} name="statusFilter" type="bottom-sheet" className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
								<option value="">{t('Common.All', 'All')}</option>
								<option value={OfferingStatus.Active}>{t('Common.Active', 'Active')}</option>
								<option value={OfferingStatus.Inactive}>{t('Common.Inactive', 'Inactive')}</option>
							</FormInput>
							<div className="flex gap-2">
								<button type="button" onClick={() => fetchOfferings(0)} className="btn btn-primary">
									{t('Common.Search', 'Search')}
								</button>
								<button type="button" onClick={handleReset} className="btn btn-secondary">
									{t('Common.Reset', 'Reset')}
								</button>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
							<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
								<p className="text-xs uppercase text-gray-500">{t('Manage.Offerings.Stat_Total', 'Total offerings')}</p>
								<p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{totalCount}</p>
							</div>
						</div>

						{loading ? (
							<AnimationSkeleton />
						) : offerings.length === 0 ? (
							<div className="rounded-lg border border-dashed border-gray-200 p-10 text-center dark:border-gray-700">
								<i className="ri-shopping-bag-3-line text-4xl text-gray-300" />
								<p className="mt-3 text-lg font-medium text-gray-700 dark:text-gray-200">{t('Manage.Offerings.Empty_Title', 'No offerings found')}</p>
							</div>
						) : (
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{offerings.map((offering) => {
									const status = Number(offering.status)
									const type = Number(offering.type)
									const isActive = status === OfferingStatus.Active
									return (
										<div key={offering.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="truncate text-base font-semibold text-gray-800 dark:text-gray-100">{offering.name}</h3>
														<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{type === OfferingType.Project ? t('Manage.Offerings.Type_Project', 'Project') : t('Manage.Offerings.Type_Product', 'Product')}</span>
														<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status === OfferingStatus.Active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
															{status === OfferingStatus.Active ? t('Common.Active', 'Active') : t('Common.Inactive', 'Inactive')}
														</span>
													</div>
													<p className="mt-2 line-clamp-2 text-sm text-gray-500">{offering.description || t('Manage.Offerings.NoDescription', 'No description')}</p>
												</div>
												<ActionDropdown
													label={t('Common.Action', 'Action')}
													menuWidth={160}
													minWidthPx={160}
													items={[
														{ key: 'edit', label: t('Common.Edit', 'Edit'), onClick: () => openEdit(offering), permission: PermissionTypes.Permissions_ManageOfferings_Update, disabled: !canUpdate },
														{ key: 'status', label: status === OfferingStatus.Active ? t('Common.Deactivate', 'Deactivate') : t('Common.Activate', 'Activate'), onClick: () => handleStatusToggle(offering), permission: PermissionTypes.Permissions_ManageOfferings_Update, disabled: !canUpdate },
														{ key: 'delete', label: t('Common.Delete', 'Delete'), onClick: () => setDeleteTarget(offering), permission: PermissionTypes.Permissions_ManageOfferings_Delete, disabled: !canDelete },
													]}
												/>
											</div>
											<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
												<div>
													<p className="text-xs text-gray-400">{t('Manage.Offerings.Owner', 'Owner')}</p>
													<p className="truncate font-medium text-gray-700 dark:text-gray-200">{userNameById.get(offering.ownerUserId) ?? offering.ownerUserId}</p>
												</div>
												<div>
													<p className="text-xs text-gray-400">{t('Manage.Offerings.Leads', 'Leads')}</p>
													<p className="font-medium text-gray-700 dark:text-gray-200">{offering.leadCount}</p>
												</div>
												<div className="col-span-2">
													<p className="text-xs text-gray-400">{t('Manage.Offerings.ExpectedValue', 'Expected value')}</p>
													<p className="font-medium text-gray-700 dark:text-gray-200">
														{offering.expectedValueFrom || offering.expectedValueTo
															? `${offering.expectedValueFrom ?? 0} - ${offering.expectedValueTo ?? 0}`
															: t('Common.NotAvailable', 'N/A')}
													</p>
												</div>
											</div>
											<div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
												{isActive && canCreateLead && (
													<button
														type="button"
														className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
														title={t('Manage.Offerings.Action_AddLead', 'Add Lead')}
														aria-label={t('Manage.Offerings.Action_AddLead', 'Add Lead')}
														onClick={() => navigate(buildOfferingUrl(MenuLinks.AddLead, offering.uniqueId))}
													>
														<i className="ri-user-add-line text-lg" />
													</button>
												)}
												{canViewLeads && (
													<button
														type="button"
														className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
														title={t('Manage.Offerings.Action_ViewLeads', 'View Leads')}
														aria-label={t('Manage.Offerings.Action_ViewLeads', 'View Leads')}
														onClick={() => navigate(buildOfferingUrl(MenuLinks.ManageLeads, offering.uniqueId))}
													>
														<i className="ri-group-line text-lg" />
													</button>
												)}
												{canViewPipeline && (
													<button
														type="button"
														className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
														title={t('Manage.Offerings.Action_ViewPipeline', 'View Pipeline')}
														aria-label={t('Manage.Offerings.Action_ViewPipeline', 'View Pipeline')}
														onClick={() => navigate(buildOfferingUrl(MenuLinks.SalesPipeline, offering.uniqueId))}
													>
														<i className="ri-funds-line text-lg" />
													</button>
												)}
											</div>
										</div>
									)
								})}
							</div>
						)}

						{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} hasPreviousPage={hasPreviousPage} hasNextPage={hasNextPage} onPageChange={(page) => fetchOfferings(page)} />}
					</div>
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={showModal} toggleModal={closeModal} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<div className="rounded bg-white shadow-sm dark:bg-gray-800">
					<div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
						<h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{editingOffering ? t('Manage.Offerings.Edit_Title', 'Edit Offering') : t('Manage.Offerings.Add_Title', 'New Offering')}</h4>
					</div>
					<VerticalForm<OfferingFormValues> key={editingOffering?.id ?? 'new'} onSubmit={handleSubmit} resolver={schemaResolver as any} defaultValues={modalDefaults}>
						<div className="grid gap-5 p-6">
							<FormInput label={t('Manage.Offerings.Name', 'Name')} name="name" type="text" required className="form-input" />
							<div className="grid gap-5 sm:grid-cols-2">
								<FormInput label={t('Manage.Offerings.Type', 'Type')} name="type" type="bottom-sheet" required className="form-select">
									<option value={OfferingType.Product}>{formatHelper.punctuateLabel(OfferingType[OfferingType.Product])}</option>
									<option value={OfferingType.Project}>{formatHelper.punctuateLabel(OfferingType[OfferingType.Project])}</option>
								</FormInput>
								<FormInput label={t('Manage.Offerings.Status', 'Status')} name="status" type="bottom-sheet" required className="form-select">
									<option value={OfferingStatus.Active}>{formatHelper.punctuateLabel(OfferingStatus[OfferingStatus.Active])}</option>
									<option value={OfferingStatus.Inactive}>{formatHelper.punctuateLabel(OfferingStatus[OfferingStatus.Inactive])}</option>
								</FormInput>
							</div>
							<FormInput label={t('Manage.Offerings.Owner', 'Owner')} name="ownerUserId" type="bottom-sheet" required className="form-select">
								{users.map((u) => (
									<option key={u.strValue} value={u.strValue}>
										{u.text}
									</option>
								))}
							</FormInput>
							<div className="grid gap-5 sm:grid-cols-2">
								<FormInput label={t('Manage.Offerings.ExpectedValueFrom', 'Expected value from')} name="expectedValueFrom" type="number" className="form-input" />
								<FormInput label={t('Manage.Offerings.ExpectedValueTo', 'Expected value to')} name="expectedValueTo" type="number" className="form-input" />
							</div>
							<FormInput label={t('Manage.Offerings.Description', 'Description')} name="description" type="textarea" rows={4} className="form-input" />
						</div>
						<div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
							<button type="button" className="btn btn-secondary" onClick={closeModal}>
								{t('Common.Cancel', 'Cancel')}
							</button>
							<button className="btn btn-primary">{t('Common.Save', 'Save')}</button>
						</div>
					</VerticalForm>
				</div>
			</ModalLayout>

			<DeleteConfirmation isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('Manage.Offerings.Delete_Title', 'Delete Offering')} description={t('Manage.Offerings.Delete_Description', 'This offering will be archived and removed from active lists.')} />
		</>
	)
}

export default ManageOfferings
