import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

//default selected country 
const savedCountryCode = localStorage.getItem('appCountryCode') || 'us'

i18n.use(initReactI18next).init({
	lng: savedCountryCode,
	fallbackLng: 'us',
	ns: ['translation'],
	defaultNS: 'translation',
	resources: {},
	interpolation: {
		escapeValue: false,
	},
	react: {
		useSuspense: false,
	},
})

// Load cached translations 
const savedCountryId = localStorage.getItem('appCountryId')
if (savedCountryId) {
	const cachedLocalizations = localStorage.getItem(`localizations_${savedCountryId}`)
	if (cachedLocalizations) {
		try {
			const translations = JSON.parse(cachedLocalizations)
			i18n.addResourceBundle(savedCountryCode, 'translation', translations, true, true)
		} catch (error) {
			console.error('Failed to load cached translations:', error)
		}
	}
}

export default i18n