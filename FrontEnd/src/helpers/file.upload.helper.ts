import { ChangeEvent } from 'react'
import { DownloadFileResponse, FileUploadRequest } from './api/WebApiClient'

export class fileUploadHelper {
	static createFileUploadRequest = async (event: ChangeEvent<HTMLInputElement>): Promise<{ fileUploadRequest: FileUploadRequest | null; isUploaded: boolean }> => {
		const file = event.target.files?.[0]
		return this.createFileRequestFromFile(file as File)
	}

	static createFileRequestFromFile = async (file: File): Promise<{ fileUploadRequest: FileUploadRequest | null; isUploaded: boolean }> => {
		if (!file) {
			return { fileUploadRequest: null, isUploaded: false }
		}

		const reader = new FileReader()

		return new Promise((resolve) => {
			reader.onloadend = () => {
				const base64String = reader.result as string
				const fileUploadRequest = new FileUploadRequest({
					data: base64String,
					name: file.name,
					extension: '.' + file.name.split('.').pop(),
				})
				resolve({ fileUploadRequest, isUploaded: true })
			}

			reader.readAsDataURL(file)
		})
	}

	static downloadFileFromResponse = (fileResponse: DownloadFileResponse) => {
		if (!fileResponse.fileBase64String || !fileResponse.name || !fileResponse.extension) {
			console.error('Invalid file response data')
			return
		}

		const byteCharacters = atob(fileResponse.fileBase64String)
		const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0))
		const byteArray = new Uint8Array(byteNumbers)

		const blob = new Blob([byteArray], { type: `application/${fileResponse.extension}` })

		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `${fileResponse.name}.${fileResponse.extension}`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}
}
