class ValidationHelper {
	static isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Simple regex for email validation
		return emailRegex.test(email)
	}

	static isEditorBodyBlank(content: string) {
		// This regular expression matches empty paragraphs like <p><br></p> or <p></p>
		const blankParagraphRegex = /^(<p>(<br>|\s)*<\/p>\s*)+$/

		// Trim the content to remove any extra spaces before checking
		return blankParagraphRegex.test(content.trim())
	}
}
export default ValidationHelper
