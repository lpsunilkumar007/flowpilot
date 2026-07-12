import { IErrorResult } from '@/interfaces/IErrorResult'
import { IValidationErrorResult } from '@/interfaces/IValidationErrorResult' // Import the new validation error model
import { toast, ToastOptions } from 'react-toastify'

export class messageHelper {
	private static defaultToastOptions: ToastOptions = {
		autoClose: false, // Prevent auto-close
		closeButton: true, // Show close button
		closeOnClick: false, // Don't close on click
		draggable: true, // Allow dragging the toast
	}

	static showErrorResult(error: unknown, buttonId?: string) {
		toast.dismiss()
		const errorResult = error as IErrorResult
		setTimeout(() => {
			// Clear previous errors
			document.querySelectorAll('.validation-error-message').forEach((el) => el.remove())
			document.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'))

			const combinedMessages: string[] = []
			const missingFieldErrors: Record<string, string> = {}

			if (errorResult.errors && typeof errorResult.errors === 'object') {
				for (const [fieldName, messages] of Object.entries(errorResult.errors)) {
					const message = messages.join(', ')

					let nameAttr = fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
					let input = document.querySelector(`[name="${nameAttr}"]`) as HTMLElement

					if (!input) {
						nameAttr = fieldName.replace(/^([A-Z]{2,3})(?=[A-Z])/, (match) => match.toLowerCase())
						input = document.querySelector(`[name="${nameAttr}"]`) as HTMLElement
					}
					if (!input) {
						nameAttr = fieldName.replace(/^([A-Z][a-zA-Z0-9]*?)\.([A-Z])/, (_, className, firstPropChar) => className.charAt(0).toLowerCase() + className.slice(1) + '.' + firstPropChar.toLowerCase())
						input = document.querySelector(`[name="${nameAttr}"]`) as HTMLElement
					}
					if (!input) {
						nameAttr = fieldName
						input = document.querySelector(`[name="${nameAttr}"]`) as HTMLElement
					}

					if (!input) {
						switch (fieldName) {
							case 'CreateClientRequest.FKStatusLookUpCodeValuePKId':
								nameAttr = 'createClientRequest.fkStatusLookUpCodeValuePKId'
								break
							case 'AppointmentParticipants':
								nameAttr = 'AppointmentParticipants'
								break
						}
						if (!input) {
							input = document.querySelector(`[name="${nameAttr}"]`) as HTMLElement
						}
					}

					if (input) {
						input.classList.add('is-invalid')

						if (!input.nextElementSibling?.classList.contains('validation-error-message')) {
							const errorDiv = document.createElement('div')
							errorDiv.className = 'validation-error-message'
							errorDiv.style.color = 'red'
							errorDiv.style.fontSize = '0.85rem'
							errorDiv.style.marginTop = '4px'
							errorDiv.textContent = message
							errorDiv.style.borderColor = 'red'
							const inputEl = input as HTMLInputElement

							if (inputEl.type === 'password') {
								const row = inputEl.closest('.flex.items-center')
								if (row && row.parentElement) {
									row.insertAdjacentElement('afterend', errorDiv)
								}
							} else {
								inputEl.insertAdjacentElement('afterend', errorDiv)
							}
						}
					} else {
						missingFieldErrors[fieldName] = message
					}
				}

				// Collect missing field messages
				combinedMessages.push(...Object.entries(missingFieldErrors).map(([key, msg]) => `${key}: ${msg}`))
			}

			// Add general messages if present
			if (Array.isArray(errorResult.messages) && errorResult.messages.length > 0) {
				combinedMessages.push(...errorResult.messages)
			} else if (typeof errorResult.messages === 'string' && errorResult.messages) {
				combinedMessages.push(errorResult.messages)
			}

			// Add exception if available
			if (errorResult.exception) {
				combinedMessages.unshift(errorResult.exception)
			}

			const fullMessage = combinedMessages.join('\n')

			// Clear previous button error message
			if (buttonId) {
				const button = document.getElementById(buttonId)
				if (button) {
					const oldError = button.nextElementSibling
					if (oldError?.classList.contains('button-error-message')) {
						oldError.remove()
					}
				}
			}

			// Show under button if possible
			if (fullMessage && buttonId) {
				const button = document.getElementById(buttonId)
				if (button) {
					const errorDiv = document.createElement('div')
					errorDiv.className = 'button-error-message text-red-600 text-sm mt-2'
					errorDiv.textContent = fullMessage
					button.insertAdjacentElement('afterend', errorDiv)
					return
				}
			}

			// Fallback to toast
			if (fullMessage) {
				toast.error(fullMessage, this.defaultToastOptions)
			}
		}, 2)
	}

	static showValidationErrors(validationError: IValidationErrorResult) {
		let combinedMessage = ``

		const validationErrors = Object.entries(validationError.errors)
			.map(([key, messages]) => `${key}: ${messages.join(', ')}`)
			.join('\n')

		combinedMessage += validationErrors
		toast.error(combinedMessage, this.defaultToastOptions)
	}

	static showSuccess(message: string) {
		toast.dismiss()
		toast.success(message, {
			position: 'top-center',
			style: { zIndex: 9999 },
		})
	}
	static showWarning(message: string) {
		toast.dismiss()
		toast.warning(message)
	}
	static showError(message: string) {
		toast.dismiss()
		toast.error(message)
	}
	static showInlineError(inputName: string, message: string) {
		document.querySelectorAll('.validation-error-message').forEach((el) => el.remove())

		let input: Element | null = null

		if (inputName.startsWith('.') || inputName.startsWith('#')) {
			input = document.querySelector(inputName)
		} else {
			input = document.querySelector(`[name="${inputName}"]`)
		}

		if (input) {
			input.classList.add('is-invalid')

			const errorDiv = document.createElement('div')
			errorDiv.className = 'validation-error-message'
			errorDiv.textContent = message
			errorDiv.style.color = 'red'
			errorDiv.style.fontSize = '0.85rem'
			errorDiv.style.marginTop = '4px'

			input.insertAdjacentElement('afterend', errorDiv)
		} else {
			// Fallback toast
			toast.error(message)
		}
	}
}
