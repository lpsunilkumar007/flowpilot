import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// images
import logoMark from '@/assets/images/logo-sm.png'
import { BrandingDetails } from '@/constants'

interface AccountLayoutProps {
	pageImage?: string
	authTitle?: string
	helpText?: string
	bottomLinks?: ReactNode
	isCombineForm?: boolean
	children?: ReactNode
	hasForm?: boolean
}

const AuthLayout = ({ pageImage, authTitle, helpText, bottomLinks, children }: AccountLayoutProps) => {
	return (
		<>
			<div className="relative flex flex-col items-center">
				<div className="flex justify-center py-6">
					<div className="max-w-md px-4 mx-auto">
						<div className="card overflow-hidden">
							<div className="p-9 bg-primary">
								<Link to="/auth/login" className="flex items-center justify-center gap-3">
									<img src={logoMark} alt="" className="h-12 w-12 object-contain" />
									<span className="text-2xl font-semibold tracking-tight text-white">Flow Pilot</span>
								</Link>
							</div>
							<div className="p-9">
								<div className="text-center mx-auto w-3/4">
									{pageImage && <img src={pageImage} alt="mail sent image" className="h-16 mx-auto" />}
									<h4 className={`${pageImage ? 'mt-9' : ''} text-dark/70 text-center text-lg font-bold dark:text-light/80 mb-2`}>{authTitle}</h4>
									<p className="text-gray-400 mb-9">{helpText}</p>
								</div>

								{children}
								{bottomLinks}
							</div>
						</div>
					</div>
				</div>
			</div>

			<footer className="bottom-0 inset-x-0">
				<p className="font-medium text-center mb-3">
					{new Date().getFullYear()} © {BrandingDetails.CLIENT_NAME} - {BrandingDetails.CLIENT_WEBSITE}
				</p>
			</footer>
		</>
	)
}

export default AuthLayout
