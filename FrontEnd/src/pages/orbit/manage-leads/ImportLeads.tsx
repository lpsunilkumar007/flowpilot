import { PageBreadcrumbsWithLinks } from '@/components'
import Pagination from '@/components/Pagination'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { importClient } from '@/helpers/api/apiClients'
import {
	ApiException,
	FileParameter,
	ImportColumnDefinition,
	ImportDefinition,
	ImportParsedRow,
	SubmitImportRequest,
	type FileResponse,
} from '@/helpers/api/WebApiClient'
import { messageHelper } from '@/helpers/message.helper'
import ValidationHelper from '@/helpers/validation.helper'
import { usePermission } from '@/hooks/usePermission'
import type { IErrorResult } from '@/interfaces/IErrorResult'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ENTITY_KEY = 'leads'
const PREVIEW_PAGE_SIZE = 50
const EMAIL_COLUMN_KEY = 'email'
const PHONE_COLUMN_KEY = 'companyPhone'

const EMAIL_FORMAT_ERROR = 'Email is not a valid email address.'
const PHONE_REQUIRED_ERROR = 'Company Phone is required.'
const PHONE_FORMAT_ERROR = 'Company Phone is not a valid mobile number.'

const COLUMN_SECTIONS: { title: string; keys: string[] }[] = [
	{ title: 'Business Information', keys: ['company', 'publicPrivate', 'domain', 'employee', 'revenue'] },
	{ title: 'Contact Person', keys: ['name', 'title', 'email', 'companyPhone', 'firstname', 'lastname'] },
	{ title: 'Address', keys: ['address', 'city', 'state', 'zip', 'zip4', 'country'] },
	{ title: 'Additional Information', keys: ['sic4', 'naics6', 'department', 'level', 'founded', 'linkedIn', 'externalId'] },
]

const downloadFileResponse = (response: FileResponse, fallbackName: string) => {
	const url = window.URL.createObjectURL(response.data)
	const link = document.createElement('a')
	link.href = url
	link.download = response.fileName || fallbackName
	document.body.appendChild(link)
	link.click()
	link.remove()
	window.URL.revokeObjectURL(url)
}

const getErrorMessage = (error: unknown, fallback: string) => {
	if (error instanceof ApiException) {
		return error.response || error.message || fallback
	}
	if (error instanceof Error && error.message) {
		return error.message
	}
	const result = error as IErrorResult
	if (Array.isArray(result?.messages) && result.messages.length > 0) {
		return result.messages.join('\n')
	}
	if (typeof result?.exception === 'string' && result.exception) {
		return result.exception
	}
	return fallback
}

const groupColumns = (columns: ImportColumnDefinition[]) => {
	const remaining = [...columns]
	const groups = COLUMN_SECTIONS.map((section) => {
		const matched: ImportColumnDefinition[] = []
		for (const key of section.keys) {
			const index = remaining.findIndex((column) => (column.key ?? '').toLowerCase() === key.toLowerCase())
			if (index >= 0) {
				matched.push(remaining.splice(index, 1)[0])
			}
		}
		return { title: section.title, columns: matched }
	}).filter((group) => group.columns.length > 0)

	if (remaining.length > 0) {
		const extra = groups.find((group) => group.title === 'Additional Information')
		if (extra) {
			extra.columns.push(...remaining)
		} else {
			groups.push({ title: 'Additional Information', columns: remaining })
		}
	}

	return groups
}

const getRowValue = (row: ImportParsedRow, key: string) => (row.values?.[key] ?? '').trim()

const isContactFieldError = (error: string, field: 'email' | 'phone') => {
	const lower = error.toLowerCase()
	if (field === 'email') {
		return lower.includes('email')
	}

	return lower.includes('company phone') || lower.includes('company_phone') || lower.includes('mobile')
}

const applyEmailMobileValidation = (row: ImportParsedRow, editedKey?: string) => {
	let errors = [...(row.errors ?? [])]

	if (editedKey === EMAIL_COLUMN_KEY) {
		errors = errors.filter((error) => !isContactFieldError(error, 'email'))
	} else if (editedKey === PHONE_COLUMN_KEY) {
		errors = errors.filter((error) => !isContactFieldError(error, 'phone'))
	} else {
		errors = errors.filter((error) => error !== EMAIL_FORMAT_ERROR && error !== PHONE_FORMAT_ERROR)
	}

	const email = getRowValue(row, EMAIL_COLUMN_KEY)
	const phone = getRowValue(row, PHONE_COLUMN_KEY)

	if (email && !ValidationHelper.isValidEmail(email) && !errors.includes(EMAIL_FORMAT_ERROR)) {
		errors.push(EMAIL_FORMAT_ERROR)
	}

	if (!phone) {
		if (editedKey === PHONE_COLUMN_KEY && !errors.some((error) => error.toLowerCase().includes('company phone is required'))) {
			errors.push(PHONE_REQUIRED_ERROR)
		}
	} else if (!ValidationHelper.isValidMobile(phone) && !errors.includes(PHONE_FORMAT_ERROR)) {
		errors.push(PHONE_FORMAT_ERROR)
	}

	return new ImportParsedRow({
		...row,
		errors,
		isValid: errors.length === 0,
	})
}

const hasColumnError = (row: ImportParsedRow, column: ImportColumnDefinition) => {
	const header = (column.header ?? '').toLowerCase()
	const key = (column.key ?? '').toLowerCase()
	return (row.errors ?? []).some((error) => {
		const lower = error.toLowerCase()
		if (header && lower.includes(header)) return true
		if (key && lower.includes(key)) return true
		if (key === PHONE_COLUMN_KEY.toLowerCase() && (lower.includes('mobile') || lower.includes('company phone') || lower.includes('company_phone'))) return true
		return false
	})
}

const ImportLeads = () => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const canView = userHasPermission(PermissionTypes.Permissions_ManageLeads_View)
	const canCreate = userHasPermission(PermissionTypes.Permissions_ManageLeads_Create)
	const canExport = userHasPermission(PermissionTypes.Permissions_ManageLeads_Export)

	const [definition, setDefinition] = useState<ImportDefinition | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [rows, setRows] = useState<ImportParsedRow[]>([])
	const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(true)
	const [isParsing, setIsParsing] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isExporting, setIsExporting] = useState(false)
	const [showInvalidFirst, setShowInvalidFirst] = useState(true)
	const [previewPage, setPreviewPage] = useState(1)

	const columns = definition?.columns ?? []
	const columnGroups = useMemo(() => groupColumns(columns), [columns])
	const flatColumns = useMemo(() => columnGroups.flatMap((group) => group.columns), [columnGroups])
	const validCount = useMemo(() => rows.filter((row) => row.isValid).length, [rows])
	const invalidCount = rows.length - validCount
	const hasValidRows = validCount > 0
	const displayRows = useMemo(() => {
		if (!showInvalidFirst) {
			return rows
		}

		return [...rows].sort((left, right) => Number(left.isValid) - Number(right.isValid) || (left.rowNumber ?? 0) - (right.rowNumber ?? 0))
	}, [rows, showInvalidFirst])
	const previewTotalPages = Math.max(1, Math.ceil(displayRows.length / PREVIEW_PAGE_SIZE))
	const safePreviewPage = Math.min(previewPage, previewTotalPages)
	const pagedRows = useMemo(() => {
		const start = (safePreviewPage - 1) * PREVIEW_PAGE_SIZE
		return displayRows.slice(start, start + PREVIEW_PAGE_SIZE)
	}, [displayRows, safePreviewPage])

	useEffect(() => {
		const loadDefinitions = async () => {
			try {
				setIsLoadingDefinitions(true)
				const data = await importClient.getDefinitions()
				const leadsDefinition = (data ?? []).find((item) => (item.key ?? '').toLowerCase() === ENTITY_KEY) ?? data?.[0] ?? null
				setDefinition(leadsDefinition)
			} catch (error) {
				messageHelper.showError(getErrorMessage(error, 'Unable to load import definitions.'))
			} finally {
				setIsLoadingDefinitions(false)
			}
		}

		if (canView || canCreate) {
			void loadDefinitions()
		} else {
			setIsLoadingDefinitions(false)
		}
	}, [canView, canCreate])

	const resetParsedState = () => {
		setRows([])
		setSelectedFile(null)
		setPreviewPage(1)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const assignFile = (file: File | undefined) => {
		if (!file) return
		const extension = file.name.split('.').pop()?.toLowerCase()
		if (extension !== 'csv') {
			messageHelper.showError('Only CSV (.csv) files are supported.')
			return
		}
		setSelectedFile(file)
		setRows([])
		setPreviewPage(1)
	}

	const handleDownloadTemplate = async () => {
		try {
			const response = await importClient.downloadTemplate(ENTITY_KEY)
			downloadFileResponse(response, 'leads-template.csv')
		} catch (error) {
			messageHelper.showError(getErrorMessage(error, 'Unable to download the CSV template.'))
		}
	}

	const handleExport = async () => {
		try {
			setIsExporting(true)
			const response = await importClient.export(ENTITY_KEY)
			downloadFileResponse(response, 'leads.csv')
		} catch (error) {
			messageHelper.showError(getErrorMessage(error, 'Unable to export CSV.'))
		} finally {
			setIsExporting(false)
		}
	}

	const handleParse = async () => {
		if (!canCreate) {
			messageHelper.showError('You do not have permission to import data.')
			return
		}
		if (!selectedFile) {
			messageHelper.showError('Please select a CSV file first.')
			return
		}

		try {
			setIsParsing(true)
			const fileParameter: FileParameter = {
				data: selectedFile,
				fileName: selectedFile.name,
			}
			const parseStartedAt = performance.now()
			// #region agent log
			fetch('http://127.0.0.1:7417/ingest/6348a9ad-0cfe-459b-b00f-c31ec15f41c1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'024bd0'},body:JSON.stringify({sessionId:'024bd0',hypothesisId:'H3',location:'ImportLeads.tsx:handleParse:start',message:'parse started',data:{fileSize:selectedFile.size,fileNameLength:selectedFile.name.length},timestamp:Date.now()})}).catch(()=>{})
			// #endregion
			const response = await importClient.parse(ENTITY_KEY, fileParameter)
			const apiMs = Math.round(performance.now() - parseStartedAt)
			const rowCount = response.rows?.length ?? 0
			const setRowsStartedAt = performance.now()
			setRows((response.rows ?? []).map((row) => applyEmailMobileValidation(row)))
			setPreviewPage(1)
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					// #region agent log
					fetch('http://127.0.0.1:7417/ingest/6348a9ad-0cfe-459b-b00f-c31ec15f41c1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'024bd0'},body:JSON.stringify({sessionId:'024bd0',hypothesisId:'H4',location:'ImportLeads.tsx:handleParse:afterPaint',message:'parse client timings',data:{apiMs,renderMs:Math.round(performance.now()-setRowsStartedAt),rowCount,totalRows:response.totalRows??0,validRows:response.validRows??0},timestamp:Date.now()})}).catch(()=>{})
					// #endregion
					// #region agent log
					fetch('http://127.0.0.1:7417/ingest/6348a9ad-0cfe-459b-b00f-c31ec15f41c1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'024bd0'},body:JSON.stringify({sessionId:'024bd0',runId:'post-fix',hypothesisId:'H4',location:'ImportLeads.tsx:handleParse:pagedPaint',message:'paged preview paint',data:{pageSize:PREVIEW_PAGE_SIZE,displayedRows:Math.min(PREVIEW_PAGE_SIZE,rowCount),totalRows:rowCount},timestamp:Date.now()})}).catch(()=>{})
					// #endregion
				})
			})
			messageHelper.showSuccess(`Parsed ${response.totalRows ?? 0} rows.`)
		} catch (error) {
			messageHelper.showError(getErrorMessage(error, 'Unable to parse the CSV file.'))
		} finally {
			setIsParsing(false)
		}
	}

	const handleRowValueChange = (rowNumber: number | undefined, key: string, value: string) => {
		setRows((current) => {
			const index = current.findIndex((row) => row.rowNumber === rowNumber)
			if (index < 0) return current
			const next = current.slice()
			const row = current[index]
			next[index] = applyEmailMobileValidation(
				new ImportParsedRow({
					...row,
					values: { ...row.values, [key]: value },
				}),
				key
			)
			return next
		})
	}

	const handleSubmit = async () => {
		if (!canCreate) {
			messageHelper.showError('You do not have permission to import data.')
			return
		}
		if (rows.length === 0) {
			messageHelper.showError('Parse a CSV file before submitting.')
			return
		}

		const validRows = rows.filter((row) => row.isValid)
		if (validRows.length === 0) {
			messageHelper.showError('No valid rows found. Please fix email and mobile errors before submitting.')
			return
		}

		try {
			setIsSubmitting(true)
			const submitStartedAt = performance.now()
			// #region agent log
			fetch('http://127.0.0.1:7417/ingest/6348a9ad-0cfe-459b-b00f-c31ec15f41c1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'024bd0'},body:JSON.stringify({sessionId:'024bd0',hypothesisId:'H5',location:'ImportLeads.tsx:handleSubmit:start',message:'submit started',data:{rowCount:rows.length,validCount:rows.filter((row)=>row.isValid).length},timestamp:Date.now()})}).catch(()=>{})
			// #endregion
			const response = await importClient.submit(
				ENTITY_KEY,
				new SubmitImportRequest({
					rows: validRows,
				})
			)
			// #region agent log
			fetch('http://127.0.0.1:7417/ingest/6348a9ad-0cfe-459b-b00f-c31ec15f41c1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'024bd0'},body:JSON.stringify({sessionId:'024bd0',hypothesisId:'H5',location:'ImportLeads.tsx:handleSubmit:done',message:'submit client timings',data:{apiMs:Math.round(performance.now()-submitStartedAt),inserted:response.inserted??0,updated:response.updated??0,failed:response.failed??0,resultCount:response.results?.length??0},timestamp:Date.now()})}).catch(()=>{})
			// #endregion
			setRows((current) =>
				current.map((row) => {
					const result = response.results?.find((item) => item.rowNumber === row.rowNumber)
					if (!result) return row
					return new ImportParsedRow({
						...row,
						action: result.action,
						isValid: result.success,
						errors: result.success ? [] : [result.error ?? 'Import failed.'],
					})
				})
			)
			messageHelper.showSuccess(`Inserted: ${response.inserted ?? 0}, Updated: ${response.updated ?? 0}, Failed: ${response.failed ?? 0}`)
		} catch (error) {
			messageHelper.showError(getErrorMessage(error, 'Unable to submit import rows.'))
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!canView && !canCreate) {
		return (
			<>
				<PageBreadcrumbsWithLinks
					title={t('Manage.Leads.Import_Heading', 'Import Leads')}
					subNames={[{ label: t('Manage.Leads_Heading', 'Leads'), link: MenuLinks.ManageLeads }, { label: t('Manage.Leads.Import.Breadcrumb', 'Import') }]}
				/>
				<div className="card p-6 text-sm text-red-600">{t('Manage.Leads.Import_NoPermission', 'You do not have permission to import or export leads.')}</div>
			</>
		)
	}

	return (
		<div className="min-w-0 max-w-full">
			<PageBreadcrumbsWithLinks
				title={t('Manage.Leads.Import_Heading', 'Import Leads')}
				subNames={[{ label: t('Manage.Leads_Heading', 'Leads'), link: MenuLinks.ManageLeads }, { label: t('Manage.Leads.Import.Breadcrumb', 'Import') }]}
			/>

			<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<p className="mt-1 font-semibold text-gray-600">
					{t('Manage.Leads.Import_Helper', 'Upload a CSV file, review the parsed leads, and import valid rows.')}
				</p>
				<div className="flex flex-wrap gap-2">
					<button type="button" onClick={handleDownloadTemplate} disabled={isLoadingDefinitions} className="btn bg-light text-gray-800 rounded-lg border">
						<i className="ri-download-2-line me-2"></i>
						{t('Manage.Leads.Import_Template', 'Download Sample Template')}
					</button>
					{canExport && (
						<button type="button" onClick={handleExport} disabled={isExporting} className="btn rounded-lg bg-primary text-white hover:opacity-90">
							<i className="ri-file-download-line me-2"></i>
							{isExporting ? t('Manage.Leads.Import_Exporting', 'Exporting...') : t('Manage.Leads.Import_Export', 'Export CSV')}
						</button>
					)}
				</div>
			</div>

			<div className="card min-w-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				<div className="card-body min-w-0 p-6">
					{definition?.description && <p className="mb-5 text-sm text-gray-500">{definition.description}</p>}

					{rows.length === 0 && selectedFile && (
						<div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
										<i className="ri-file-text-line text-2xl text-primary"></i>
									</div>
									<div>
										<div className="font-semibold">{selectedFile.name}</div>
										<div className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</div>
									</div>
								</div>
								<button type="button" onClick={resetParsedState} className="btn bg-light text-gray-800 rounded-lg border">
									{t('Common.Remove', 'Remove')}
								</button>
							</div>
						</div>
					)}

					{rows.length === 0 && !selectedFile && (
						<div
							className={`rounded-xl border-2 border-dashed px-8 py-20 text-center transition ${
								isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'
							}`}
							onDragOver={(event) => {
								event.preventDefault()
								setIsDragging(true)
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={(event) => {
								event.preventDefault()
								setIsDragging(false)
								assignFile(event.dataTransfer.files?.[0])
							}}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".csv"
								className="hidden"
								onChange={(event) => assignFile(event.target.files?.[0])}
							/>
							<div className="flex flex-col items-center">
								<i className="ri-upload-cloud-2-line mb-4 text-6xl text-primary"></i>
								<h4 className="mb-2 text-lg font-semibold">{t('Manage.Leads.Import_Drop', 'Drag & Drop CSV File Here')}</h4>
								<p className="mb-5 text-gray-500">{t('Manage.Leads.Import_Format', 'Supported format: .csv')}</p>
								<button type="button" className="btn rounded-lg bg-primary text-white hover:opacity-90" onClick={() => fileInputRef.current?.click()}>
									{t('Manage.Leads.Import_Browse', 'Browse File')}
								</button>
							</div>
						</div>
					)}

					{rows.length > 0 && (
						<div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="rounded-xl border bg-white p-5 shadow-sm">
								<div className="text-sm text-gray-500">{t('Manage.Leads.Import_Total', 'Total Rows')}</div>
								<div className="text-2xl font-semibold">{rows.length}</div>
							</div>
							<div className="rounded-xl border border-green-200 bg-green-50 p-5">
								<div className="text-sm text-gray-500">{t('Manage.Leads.Import_Valid', 'Valid Rows')}</div>
								<div className="text-2xl font-semibold text-green-600">{validCount}</div>
							</div>
							<div className="rounded-xl border border-red-200 bg-red-50 p-5">
								<div className="text-sm text-gray-500">{t('Manage.Leads.Import_Invalid', 'Invalid Rows')}</div>
								<div className="text-2xl font-semibold text-red-600">{invalidCount}</div>
							</div>
						</div>
					)}

					{rows.length > 0 && validCount === 0 && (
						<div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
							<i className="ri-error-warning-line mr-2"></i>
							{t('Manage.Leads.Import_NoValid', 'No valid rows found. Please fix the errors and submit again, or upload a new file.')}
						</div>
					)}

					{rows.length > 0 && (
						<>
							<div className="mb-4 mt-8 flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
								<h4 className="text-lg font-semibold">{t('Manage.Leads.Import_Preview', 'Import Preview')}</h4>
								<div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
									<span>{t('Manage.Leads.Import_Review', 'Review the imported data before submitting.')}</span>
									<label className="inline-flex items-center gap-2 select-none">
										<input
											type="checkbox"
											className="form-checkbox rounded text-primary focus:ring-primary/20"
											checked={showInvalidFirst}
											onChange={(event) => {
												setShowInvalidFirst(event.target.checked)
												setPreviewPage(1)
											}}
										/>
										<span>{t('Manage.Leads.Import_InvalidFirst', 'Show invalid rows first')}</span>
									</label>
								</div>
							</div>

							<div className="overflow-auto rounded-xl border border-gray-200 shadow-sm" style={{ width: 0, minWidth: '100%', maxHeight: 560 }}>
								<table className="w-max min-w-full border-separate border-spacing-0 text-sm">
									<thead className="sticky top-0 z-20">
										<tr>
											<th className="sticky left-0 z-30 w-14 min-w-14 border-b bg-gray-100 px-3 py-2 shadow-[2px_0_0_0_rgba(229,231,235,1)]" />
											<th className="w-24 min-w-24 border-b bg-gray-100 px-3 py-2" />
											{columnGroups.map((group) => (
												<th
													key={group.title}
													colSpan={group.columns.length}
													className="whitespace-nowrap border-b border-l bg-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
												>
													{group.title}
												</th>
											))}
											<th className="sticky right-0 z-30 w-72 min-w-72 max-w-72 border-b border-l bg-gray-100 px-3 py-2 shadow-[-2px_0_0_0_rgba(229,231,235,1)]" />
										</tr>
										<tr>
											<th className="sticky left-0 z-30 w-14 min-w-14 whitespace-nowrap border-b bg-gray-50 px-3 py-3 text-left shadow-[2px_0_0_0_rgba(229,231,235,1)]">
												#
											</th>
											<th className="w-24 min-w-24 whitespace-nowrap border-b bg-gray-50 px-3 py-3 text-left">
												{t('Manage.Leads.Import_Action', 'Action')}
											</th>
											{flatColumns.map((column) => (
												<th key={column.key} className="whitespace-nowrap border-b bg-gray-50 px-3 py-3 text-left">
													{column.header}
													{column.required ? ' *' : ''}
												</th>
											))}
											<th className="sticky right-0 z-30 w-72 min-w-72 max-w-72 border-b border-l bg-gray-50 px-3 py-3 text-left shadow-[-2px_0_0_0_rgba(229,231,235,1)]">
												{t('Manage.Leads.Import_Errors', 'Errors')}
											</th>
										</tr>
									</thead>
									<tbody>
										{pagedRows.map((row) => {
											const errorText = (row.errors ?? []).join(', ')
											const rowBg = !row.isValid ? 'bg-red-50' : 'bg-white'
											return (
												<tr key={row.rowNumber} className={rowBg}>
													<td className={`sticky left-0 z-10 w-14 min-w-14 whitespace-nowrap border-b px-3 py-2 ${rowBg} shadow-[2px_0_0_0_rgba(229,231,235,1)]`}>
														{row.rowNumber}
													</td>
													<td className="w-24 min-w-24 whitespace-nowrap border-b px-3 py-2">{row.action}</td>
													{flatColumns.map((column) => {
														const hasFieldError = hasColumnError(row, column)
														return (
															<td key={column.key} className="border-b px-3 py-2">
																<input
																	type={column.key === EMAIL_COLUMN_KEY ? 'email' : 'text'}
																	inputMode={column.key === PHONE_COLUMN_KEY ? 'tel' : undefined}
																	value={row.values?.[column.key ?? ''] ?? ''}
																	onChange={(event) => handleRowValueChange(row.rowNumber, column.key ?? '', event.target.value)}
																	className={`form-input !h-9 !w-40 !min-w-0 !max-w-[160px] ${hasFieldError ? 'border-red-500' : ''}`}
																/>
															</td>
														)
													})}
													<td className={`sticky right-0 z-10 w-72 min-w-72 max-w-72 border-b border-l px-2 py-2 ${rowBg} shadow-[-2px_0_0_0_rgba(229,231,235,1)]`}>
														<div
															className={`max-h-16 overflow-auto whitespace-pre-wrap break-words pr-1 text-xs leading-5 ${
																errorText ? 'text-red-600' : 'text-gray-400'
															}`}
															title={errorText || 'No errors'}
														>
															{errorText || '—'}
														</div>
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
							{displayRows.length > PREVIEW_PAGE_SIZE && (
								<Pagination
									currentPage={safePreviewPage}
									totalPages={previewTotalPages}
									hasPreviousPage={safePreviewPage > 1}
									hasNextPage={safePreviewPage < previewTotalPages}
									onPageChange={setPreviewPage}
								/>
							)}
						</>
					)}

					<div className="mt-6 flex justify-end gap-2 border-t px-1 pt-4">
						{rows.length > 0 && (
							<button type="button" onClick={resetParsedState} className="btn rounded-lg border bg-light text-gray-800">
								{t('Manage.Leads.Import_Another', 'Upload Another File')}
							</button>
						)}
						{canCreate && (
							<button
								type="button"
								onClick={rows.length > 0 ? handleSubmit : handleParse}
								disabled={rows.length > 0 ? isSubmitting || !hasValidRows : !selectedFile || isParsing}
								className={`btn rounded-lg text-white ${
									rows.length > 0
										? !isSubmitting && hasValidRows
											? 'bg-primary'
											: 'cursor-not-allowed bg-gray-300'
										: selectedFile && !isParsing
											? 'bg-primary'
											: 'cursor-not-allowed bg-gray-300'
								}`}
							>
								{rows.length > 0
									? isSubmitting
										? t('Manage.Leads.Import_Submitting', 'Submitting...')
										: t('Manage.Leads.Import_Submit', 'Submit Valid Rows')
									: isParsing
										? t('Manage.Leads.Import_Parsing', 'Parsing...')
										: t('Manage.Leads.Import_Parse', 'Parse File')}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ImportLeads
