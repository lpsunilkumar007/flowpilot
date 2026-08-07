const apiUrl = import.meta.env.PROD
	? import.meta.env.VITE_API_URL
	: import.meta.env.VITE_LOCAL_API_URL

if (!apiUrl) {
	throw new Error('API URL is not configured')
}

const config = {
	API_URL: apiUrl,
}

export default config
