import React from 'react'

interface TimeZoneWarningProps {
	isOpen: boolean
	onIgnore: () => void
	onUpdate: () => void
	title?: string
	description?: string
	expectedTimeZone?: string
	userTimeZone?: string
}

const TimeZoneWarning: React.FC<TimeZoneWarningProps> = ({ isOpen, onIgnore, onUpdate, title = 'Time Zone Mismatch Detected', description = "Your device's time zone does not match your account's time zone. This may cause time-based data to display incorrectly.", expectedTimeZone, userTimeZone }) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="sm:max-w-md w-full m-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
				<div className="p-6">
					<div className="text-center">
						<i className="ri-alert-fill text-4xl text-yellow-500 mb-4"></i>
						<h4 className="text-xl font-medium mt-3 mb-2.5 text-gray-900 dark:text-white">{title}</h4>
						<p className="mt-4 mb-4 text-gray-600 dark:text-gray-300">{description}</p>

						{expectedTimeZone && userTimeZone && (
							<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-4 text-left">
								<div className="mb-2">
									<strong>Your device time zone:</strong> {userTimeZone}
								</div>
								<div>
									<strong>Account time zone:</strong> {expectedTimeZone}
								</div>
								<p className="mt-2 text-sm">This mismatch may affect how dates or times are displayed in the app.</p>
							</div>
						)}

						<div className="flex gap-3 justify-center mt-6">
							<button type="button" className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 px-6" onClick={onIgnore}>
								Ignore
							</button>
							<button type="button" className="btn bg-primary text-white hover:bg-primary/90 px-6" onClick={onUpdate}>
								Update your time zone
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TimeZoneWarning
