import { ReactNode } from 'react'

interface PopupHeaderProps {
	title: string | ReactNode
	onClose: () => void
}

const PopupHeader: React.FC<PopupHeaderProps> = ({ title, onClose }) => {
	return (
		<div className="flex justify-between items-center py-2.5 px-4 border-b dark:border-gray-700">
			<h3 className="font-medium text-gray-600 dark:text-gray-300 text-lg">{title}</h3>
			<button onClick={onClose} className="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 dark:text-gray-200" type="button">
				<i className="ri-close-line text-2xl"></i>
			</button>
		</div>
	)
}

export default PopupHeader
