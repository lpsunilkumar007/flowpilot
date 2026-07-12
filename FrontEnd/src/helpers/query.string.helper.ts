// queryStringHelper.ts
import { useLocation } from 'react-router-dom'

export const useQueryString = () => {
	const location = useLocation()
	return new URLSearchParams(location.search)
}

export const getQueryStringValue = (key: string, query: URLSearchParams): string | null => {
	return query.get(key)
}
