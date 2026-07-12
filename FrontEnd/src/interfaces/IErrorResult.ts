export interface IErrorResult {
	messages: string[]
	errors?: {
		[key: string]: string[]
	}
	source?: string
	exception?: string
	errorId?: string
	supportMessage?: string
	email?: string
	statusCode?: string
}
