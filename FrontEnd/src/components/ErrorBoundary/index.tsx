import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
	hasError: boolean
	error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo)
	}

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback
			}
			return (
				<div className="p-6 text-center">
					<h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Something went wrong</h2>
					<p className="mt-2 text-gray-600 dark:text-gray-400">{this.state.error.message}</p>
				</div>
			)
		}
		return this.props.children
	}
}

export default ErrorBoundary
