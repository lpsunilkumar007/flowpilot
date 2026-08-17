class ValidationHelper {
	static isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Simple regex for email validation
		return emailRegex.test(email.trim())
	}

	static isValidMobile = (mobile: string) => {
		const digits = mobile.replace(/\D/g, '')
		return digits.length >= 10 && digits.length <= 15
	}

	static isEditorBodyBlank(content: string) {
		// This regular expression matches empty paragraphs like <p><br></p> or <p></p>
		const blankParagraphRegex = /^(<p>(<br>|\s)*<\/p>\s*)+$/

		// Trim the content to remove any extra spaces before checking
		return blankParagraphRegex.test(content.trim())
	}
}
export default ValidationHelper
