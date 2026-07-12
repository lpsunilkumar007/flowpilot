import { useState } from 'react'
import { FileType } from './index'
import { fileUploadHelper } from '@/helpers/file.upload.helper'
import { FileUploadRequest } from '@/helpers/api/WebApiClient'

export default function useFileUploader(showPreview: boolean = true) {
	const [selectedFiles, setSelectedFiles] = useState<FileType[]>([])

	/**
	 * Handled the accepted files and shows the preview
	 */
	const handleAcceptedFiles = async (files: FileType[], isMulti: boolean = true, callback?: (files: FileUploadRequest[]) => void) => {
		const newFiles = [...files]

		if (showPreview) {
			newFiles.forEach((file) => {
				Object.assign(file, {
					preview: file['type'].split('/')[0] === 'image' ? URL.createObjectURL(file) : null,
					formattedSize: formatBytes(file.size),
				})
			})

			const updatedSelectedFiles = isMulti ? [...selectedFiles, ...newFiles] : newFiles
			setSelectedFiles(updatedSelectedFiles)
		}

		// Convert to base64 for API requests
		const uploadRequests: FileUploadRequest[] = []
		for (const file of newFiles) {
			const { fileUploadRequest, isUploaded } = await fileUploadHelper.createFileRequestFromFile(file)
			if (isUploaded && fileUploadRequest) {
				uploadRequests.push(fileUploadRequest)
			}
		}

		if (callback) callback(uploadRequests)
		return uploadRequests
	}

	/**
	 * Formats the size
	 */
	const formatBytes = (bytes: number, decimals: number = 2) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const dm = decimals < 0 ? 0 : decimals
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
	}

	/*
	 * Removes the selected file
	 */
	const removeFile = (file: FileType) => {
		const newFiles = selectedFiles.filter((f) => f !== file)
		setSelectedFiles(newFiles)
		return newFiles
	}

	return {
		selectedFiles,
		handleAcceptedFiles,
		removeFile,
	}
}
