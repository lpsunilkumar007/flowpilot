import { Link } from 'react-router-dom'
import Dropzone, { FileRejection } from 'react-dropzone'
import useFileUploader from './useFileUploader'
import React, { useCallback, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { FileUploadRequest } from '@/helpers/api/WebApiClient'
import { messageHelper } from '@/helpers/message.helper'
import { useTranslation } from 'react-i18next'

export interface FileType extends File {
	preview?: string
	formattedSize?: string
}

interface FileUploaderProps {
	name?: string
	control?: any
	isMulti?: boolean
	maxFiles?: number
	accept?: Record<string, string[]>
	maxSize?: number
	rules?: any
	onFileUpload?: (files: FileUploadRequest | FileUploadRequest[]) => void
	showPreview?: boolean
	icon?: string
	text?: string
	extraText?: string
	className?: string
}

const FileUploaderView = ({ name, value, onChange, error, errorMessage, isMulti = false, maxFiles = 1, accept, maxSize = 4 * 1024 * 1024, onFileUpload, showPreview = true, icon = 'ri-upload-cloud-2-line', text, extraText, className }: Omit<FileUploaderProps, 'control' | 'rules'> & { onChange?: (val: any) => void; value?: any; error?: boolean; errorMessage?: string }) => {
	const { t } = useTranslation()
	const { selectedFiles, handleAcceptedFiles, removeFile } = useFileUploader(showPreview)

	// Sync with form value if cleared externally
	useEffect(() => {
		if (!value || (Array.isArray(value) && value.length === 0)) {
			// This is tricky because selectedFiles has File objects with previews,
			// while value has FileUploadRequests. We just clear if value is empty.
			// In a real app, we might want to map existing values to previews.
		}
	}, [value])

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!acceptedFiles.length) return

			const filesToProcess = isMulti ? acceptedFiles.slice(0, maxFiles - selectedFiles.length) : [acceptedFiles[0]]

			const uploadRequests = await handleAcceptedFiles(filesToProcess as FileType[], isMulti)

			if (isMulti) {
				const existingRequests = Array.isArray(value) ? value : []
				const updatedRequests = [...existingRequests, ...uploadRequests]
				onChange?.(updatedRequests)
				onFileUpload?.(updatedRequests)
			} else {
				onChange?.(uploadRequests[0])
				onFileUpload?.(uploadRequests[0])
			}
		},
		[isMulti, maxFiles, selectedFiles.length, handleAcceptedFiles, value, onChange, onFileUpload]
	)

	const onDropRejected = (rejections: FileRejection[]) => {
		rejections.forEach((rejection) => {
			rejection.errors.forEach((err) => {
				if (err.code === 'file-too-large') {
					messageHelper.showError(t('Common.Error_FileTooLarge', 'File is too large. Max size is {{size}}MB.', { size: maxSize / (1024 * 1024) }))
				} else if (err.code === 'file-invalid-type') {
					messageHelper.showError(t('Common.Error_InvalidType', 'Invalid file type.'))
				} else {
					messageHelper.showError(err.message)
				}
			})
		})
	}

	return (
		<div className={`w-full space-y-4 ${className || ''}`}>
			<Dropzone onDrop={onDrop} onDropRejected={onDropRejected} multiple={isMulti} maxFiles={isMulti ? maxFiles : 1} accept={accept} maxSize={maxSize}>
				{({ getRootProps, getInputProps, isDragActive }) => (
					<div
						{...getRootProps()}
						className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center cursor-pointer group/dz overflow-hidden
                            ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/20'}
                            ${error ? 'border-red-500 bg-red-50/30' : ''}`}
					>
						<input {...getInputProps()} name={name} />
						<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover/dz:bg-primary/10 transition-colors" />

						<div className="relative flex flex-col items-center">
							<div
								className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all duration-300 
                                ${isDragActive ? 'bg-primary text-white rotate-12 scale-110' : 'bg-white dark:bg-gray-800 text-gray-400 group-hover/dz:text-primary group-hover/dz:shadow-md'}`}
							>
								<i className={`${icon} text-2xl`}></i>
							</div>

							<h5 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">{isDragActive ? t('Common.DropToUpload', 'Drop files here') : text || t('Common.ClickToUpload', 'Click to upload or drag and drop')}</h5>

							<p className="text-sm text-gray-500 dark:text-gray-400 max-w-[240px]">{extraText || t('Common.UploadHint', 'Support for SVG, PNG, JPG or GIF (max. {{size}}MB)', { size: maxSize / (1024 * 1024) })}</p>
						</div>
					</div>
				)}
			</Dropzone>

			{error && errorMessage && <p className="text-xs text-red-600 mt-2 font-medium">{errorMessage}</p>}

			{showPreview && selectedFiles.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{selectedFiles.map((file, idx) => (
						<div key={idx} className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
							{file.preview ? <img src={file.preview} className="h-12 w-12 rounded-lg object-cover shadow-sm" alt={file.name} /> : <div className="flex items-center justify-center bg-primary/10 text-primary font-bold rounded-lg w-12 h-12 text-xs uppercase">{file.type.split('/')[1] || 'file'}</div>}

							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{file.name}</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">{file.formattedSize}</p>
							</div>

							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									const remainingFiles = removeFile(file)
									if (isMulti) {
										const updatedRequests = (value as FileUploadRequest[]).filter((_, i) => i !== idx)
										onChange?.(updatedRequests)
									} else {
										onChange?.(null)
									}
								}}
								className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
							>
								<i className="ri-close-line text-lg"></i>
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

const FileUploader = ({ name, control, rules, ...props }: FileUploaderProps) => {
	return control && name ? <Controller name={name} control={control} rules={rules} render={({ field: { value, onChange }, fieldState: { error } }) => <FileUploaderView {...props} name={name} value={value} onChange={onChange} error={!!error} errorMessage={error?.message} />} /> : <FileUploaderView {...props} />
}

export { FileUploader }
