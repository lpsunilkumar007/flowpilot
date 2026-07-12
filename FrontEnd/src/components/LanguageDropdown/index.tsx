import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PopoverLayout from '../HeadlessUI/PopoverLayout'
import { DropDownItemResponse } from '@/helpers/api/WebApiClient'
import { DropDownService } from '@/services/DropDownService'

//fetch countryflag
const flagUrl = 'https://flagcdn.com/h20'

const LanguageDropdown: React.FC = () => {
	const { i18n } = useTranslation()
	const [languages, setLanguages] = useState<DropDownItemResponse[]>([])
	const [currentCountryId, setCurrentCountryId] = useState<number>(0)
	useEffect(() => {
		loadLanguages()
	}, [])

	useEffect(() => {
		if (currentCountryId == 0 || languages.length == 0) return
		localStorage.setItem('appCountryId', currentCountryId.toString())
		const initial = languages.find((d) => d.value === currentCountryId) || languages[0]
		applyLocalizations(initial)
	}, [currentCountryId])

	//fetch saved country
	const loadLanguages = async () => {
		const response = await DropDownService.getLocalizationCountries()
		setLanguages(response)

		//Check user save country
		const savedId = localStorage.getItem('appCountryId')
		let appCountryId: number = 0
		if (savedId && Number(savedId)) {
			appCountryId = Number(savedId)
		}
		const initial = response.find((d) => d.value === appCountryId) || response[0]
		setCurrentCountryId(initial.value)
	}

	//fetch translation on behalf of country and handle paging & cache
	const applyLocalizations = async (countryDetails: DropDownItemResponse) => {
		
		const countryId: number = countryDetails.value
		const code: string = countryDetails.strValue!

		const response = await DropDownService.getCountryLocalization(countryId)
		const translations: Record<string, string> = Object.fromEntries(response.map((item) => [item.key, item.value]))
		if (i18n.hasResourceBundle(code, 'translation')) {
			i18n.removeResourceBundle(code, 'translation')
		}

		i18n.addResourceBundle(code, 'translation', translations, true, true)
		await i18n.changeLanguage(code)
	}

	const getFlagUrl = (code: string) => `${flagUrl}/${code.toLowerCase()}.png`
	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
		e.currentTarget.style.display = 'none'
	}

	const selectedLanguage = languages.find((l) => l.value === currentCountryId) || languages[0]

	if (languages.length === 0) {
		return (
			<div className="nav-link p-2">
				<div className="lg:block hidden">Loading...</div>
			</div>
		)
	}

	return (
		<PopoverLayout
			placement="bottom-end"
			togglerClass="nav-link p-2"
			toggler={
				<span className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						{selectedLanguage.strValue && <img src={getFlagUrl(selectedLanguage.strValue)} alt={selectedLanguage.strValue} onError={handleImageError} className="w-5 h-4 object-cover rounded-sm" />}
						<span>{selectedLanguage.text}</span>
						<i className="ri-arrow-down-s-line ml-1" />
					</div>
				</span>
			}
		>
			<div className="absolute end-0 w-44 mt-1 bg-white dark:bg-gray-800 shadow-lg border rounded-lg py-2 z-50">
				{languages.map((lang) => (
					<section
						key={lang.value}
						onClick={() => setCurrentCountryId(lang.value)}
						className={`
							flex items-center gap-2.5 py-2 px-3 text-sm cursor-pointer 
							hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
							${currentCountryId === lang.value ? 'bg-gray-50 dark:bg-gray-700' : ''} 							
						`}
					>
						{lang.strValue && <img src={getFlagUrl(lang.strValue)} alt={lang.strValue} className="w-5 h-4 object-cover rounded-sm flex-shrink-0" onError={handleImageError} />}
						<span>{lang.text}</span>
						{currentCountryId === lang.value && <i className="ri-check-line ml-auto text-primary-600" />}
					</section>
				))}
			</div>
		</PopoverLayout>
	)
}

export default LanguageDropdown
