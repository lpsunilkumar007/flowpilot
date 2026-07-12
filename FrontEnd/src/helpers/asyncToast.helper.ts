import { messageHelper } from '@/helpers/message.helper'

type RunWithToastOptions<T> = {
	onSuccess?: (result: T) => void
	onError?: (error: unknown) => void
	setLoading?: (loading: boolean) => void
}

export async function runWithToast<T>(fn: () => Promise<T>, options: RunWithToastOptions<T> = {}) {
	const { onSuccess, onError, setLoading } = options
	try {
		setLoading?.(true)
		const result = await fn()
		onSuccess?.(result)
		return { ok: true as const, result }
	} catch (error) {
		if (onError) onError(error)
		else messageHelper.showErrorResult(error as any)
		return { ok: false as const, error }
	} finally {
		setLoading?.(false)
	}
}

